import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, notFound, handle, requireRole } from '@/lib/api';

const VALID_STATUSES = ['Active', 'Inactive', 'Draft'];
const MIN_BONUS = 25;
const MAX_BONUS = 500;

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { id } = await params;
    const { name, description, questions, badgeConfig, missions, feedbackBonus, status } = await req.json();

    if (name !== undefined && !name.trim()) badRequest('Campaign name cannot be empty');
    if (status !== undefined && !VALID_STATUSES.includes(status)) badRequest(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    if (feedbackBonus !== undefined) {
      const b = Number(feedbackBonus);
      if (isNaN(b) || b < MIN_BONUS || b > MAX_BONUS) badRequest(`feedbackBonus must be between ${MIN_BONUS} and ${MAX_BONUS}`);
    }
    if (questions !== undefined) {
      if (!Array.isArray(questions)) badRequest('questions must be an array');
      for (const q of (questions as { points?: number }[])) {
        if (q.points !== undefined && (q.points < 20 || q.points > 100)) badRequest('Question points must be between 20 and 100');
      }
    }

    const company = await prisma.company.findFirst({ where: { managerId: user.id } });
    if (!company) notFound('Company not found');

    const campaign = await prisma.campaign.update({
      where: { id, companyId: company!.id },
      data: { name, description, questions, badgeConfig, missions, feedbackBonus, status },
    });
    return ok(campaign);
  });
