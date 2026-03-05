import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, notFound, handle, requireRole } from '@/lib/api';

export const PATCH = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { id } = await params;
    const { companyResponse, bonusPoints } = await req.json();
    if (!companyResponse) badRequest('Response text is required');

    const feedback = await prisma.feedback.findUnique({ where: { id }, include: { campaign: { include: { company: true } } } });
    if (!feedback) notFound('Feedback not found');
    if (feedback!.campaign.company.managerId !== user.id) badRequest('Feedback does not belong to your company');

    const updated = await prisma.feedback.update({ where: { id }, data: { companyResponse } });

    if (bonusPoints && bonusPoints > 0) {
      await prisma.user.update({ where: { id: feedback!.userId }, data: { points: { increment: bonusPoints } } });
    }

    return ok(updated);
  });
