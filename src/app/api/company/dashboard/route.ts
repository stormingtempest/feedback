import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, notFound, handle, requireRole } from '@/lib/api';

const companyInclude = {
  projects: {
    include: {
      campaigns: {
        include: {
          feedbacks: { where: { moderationStatus: 'Approved' }, orderBy: { createdAt: 'desc' as const } },
        },
      },
    },
  },
  campaigns: {
    where: { projectId: null as string | null },
    include: {
      feedbacks: { where: { moderationStatus: 'Approved' }, orderBy: { createdAt: 'desc' as const } },
    },
  },
};

export const GET = (req: NextRequest) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');

    let company = user.companyTag
      ? await prisma.company.findUnique({ where: { tag: user.companyTag }, include: companyInclude })
      : await prisma.company.findFirst({ where: { managerId: user.id }, include: companyInclude });

    if (!company) {
      const first = await prisma.company.findFirst();
      if (first) company = await prisma.company.findUnique({ where: { id: first.id }, include: companyInclude });
    }
    if (!company) notFound('Company not found');

    const projectIds = company!.projects?.map((p) => p.id) ?? [];
    const allFeedbacks = await prisma.feedback.findMany({
      where: { OR: [{ campaign: { projectId: { in: projectIds } } }, { campaign: { companyId: company!.id } }] },
      orderBy: { createdAt: 'desc' },
    });

    const totalFeedbacks = allFeedbacks.length;
    let totalCampaigns = company!.campaigns?.length ?? 0;
    company!.projects?.forEach((p) => { totalCampaigns += p.campaigns?.length ?? 0; });

    const typeDistribution = allFeedbacks.reduce((acc, f) => { acc[f.category] = (acc[f.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    const categoryMeasures = allFeedbacks.reduce((acc, f) => {
      if (f.ratings && typeof f.ratings === 'object') {
        Object.entries(f.ratings as Record<string, number>).forEach(([k, v]) => {
          if (!acc[k]) acc[k] = { sum: 0, count: 0 };
          acc[k].sum += v; acc[k].count += 1;
        });
      }
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const evolution = allFeedbacks.filter((f) => f.createdAt >= thirtyDaysAgo && f.internalRating).reduce((acc, f) => {
      const date = f.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { sum: 0, count: 0 };
      acc[date].sum += f.internalRating!; acc[date].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const userFeedbackCount = allFeedbacks.reduce((acc, f) => { acc[f.userId] = (acc[f.userId] || 0) + 1; return acc; }, {} as Record<string, number>);
    const topUsers = Object.entries(userFeedbackCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const statusMetrics = {
      unanswered: allFeedbacks.filter((f) => !f.companyResponse).length,
      averageResponseTime: 0,
      directives: allFeedbacks.reduce((acc, f) => { acc[f.moderationStatus] = (acc[f.moderationStatus] || 0) + 1; return acc; }, {} as Record<string, number>),
    };

    return ok({
      company: company!,
      stats: { totalProjects: company!.projects?.length ?? 0, totalCampaigns, totalFeedbacks, typeDistribution, categoryMeasures, evolution, topUsers, statusMetrics },
    });
  });
