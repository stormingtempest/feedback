import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, created, badRequest, notFound, handle, requireRole } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { name, description, projectId, questions, badgeConfig, missions, feedbackBonus } = await req.json();
    if (!name) badRequest('Name is required');

    const company = await prisma.company.findFirst({ where: { managerId: user.id } });
    if (!company) notFound('Company not found');

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        companyId: company!.id,
        projectId: projectId || null,
        questions: questions || [],
        badgeConfig: badgeConfig || {},
        missions: missions || [],
        feedbackBonus: feedbackBonus || 50,
      },
    });
    return created(campaign);
  });
