import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'COMPANY') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    let company = user.companyTag
      ? await prisma.company.findUnique({ where: { tag: user.companyTag }, include: companyInclude })
      : await prisma.company.findFirst({ where: { managerId: userId }, include: companyInclude });

    if (!company) {
      const first = await prisma.company.findFirst();
      if (first) {
        company = await prisma.company.findUnique({ where: { id: first.id }, include: companyInclude });
      }
    }
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });

    const projectIds = company.projects?.map((p) => p.id) ?? [];
    const allFeedbacks = await prisma.feedback.findMany({
      where: { OR: [{ campaign: { projectId: { in: projectIds } } }, { campaign: { companyId: company.id } }] },
      orderBy: { createdAt: 'desc' },
    });

    const totalFeedbacks = allFeedbacks.length;
    let totalCampaigns = company.campaigns?.length ?? 0;
    company.projects?.forEach((p) => { totalCampaigns += p.campaigns?.length ?? 0; });

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
      directives: allFeedbacks.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {} as Record<string, number>),
    };

    return NextResponse.json({ company, stats: { totalProjects: company.projects?.length ?? 0, totalCampaigns, totalFeedbacks, typeDistribution, categoryMeasures, evolution, topUsers, statusMetrics } });
  } catch (error) {
    console.error('Error fetching company dashboard:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
