import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, notFound, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { id } = await params;
    const { name, description, questions, badgeConfig, missions, feedbackBonus, status } = await req.json();

    const company = await prisma.company.findFirst({ where: { managerId: user.id } });
    if (!company) notFound('Company not found');

    const campaign = await prisma.campaign.update({
      where: { id, companyId: company!.id },
      data: { name, description, questions, badgeConfig, missions, feedbackBonus, status },
    });
    return ok(campaign);
  });
