import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, notFound, handle, requireRole } from '@/lib/api';

const MAX_BONUS_POINTS = 1000;

export const PATCH = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { id } = await params;
    const { companyResponse, bonusPoints } = await req.json();
    if (!companyResponse?.trim()) badRequest('Response text is required');

    const bonus = Number(bonusPoints) || 0;
    if (bonus < 0 || bonus > MAX_BONUS_POINTS) badRequest(`Bonus points must be between 0 and ${MAX_BONUS_POINTS}`);

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { campaign: { include: { company: true } } },
    });
    if (!feedback) notFound('Feedback not found');
    if (feedback!.campaign.company.managerId !== user.id) badRequest('Feedback does not belong to your company');
    if (feedback!.moderationStatus !== 'Approved') badRequest('Can only respond to approved feedbacks');

    const updated = await prisma.feedback.update({ where: { id }, data: { companyResponse: companyResponse.trim() } });

    if (bonus > 0) {
      await prisma.user.update({ where: { id: feedback!.userId }, data: { points: { increment: bonus } } });
    }

    return ok(updated);
  });
