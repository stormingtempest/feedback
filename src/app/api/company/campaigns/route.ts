import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, created, badRequest, notFound, handle, requireRole } from '@/lib/api';

const VALID_STATUSES = ['Active', 'Inactive', 'Draft'];
const MIN_BONUS = 25;
const MAX_BONUS = 500;

function validateCampaignFields({ name, feedbackBonus, questions, status }: {
  name?: string; feedbackBonus?: number; questions?: unknown[]; status?: string;
}) {
  if (name !== undefined && !name.trim()) badRequest('Campaign name cannot be empty');
  if (feedbackBonus !== undefined) {
    const b = Number(feedbackBonus);
    if (isNaN(b) || b < MIN_BONUS || b > MAX_BONUS) badRequest(`feedbackBonus must be between ${MIN_BONUS} and ${MAX_BONUS}`);
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) badRequest(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  if (questions !== undefined) {
    if (!Array.isArray(questions)) badRequest('questions must be an array');
    for (const q of questions as { points?: number }[]) {
      if (q.points !== undefined && (q.points < 20 || q.points > 100)) badRequest('Question points must be between 20 and 100');
    }
  }
}

export const POST = (req: NextRequest) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { name, description, projectId, questions, badgeConfig, missions, feedbackBonus } = await req.json();
    if (!name) badRequest('Name is required');
    validateCampaignFields({ name, feedbackBonus, questions });

    const company = await prisma.company.findFirst({ where: { managerId: user.id } });
    if (!company) notFound('Company not found');

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description,
        companyId: company!.id,
        projectId: projectId || null,
        questions: questions || [],
        badgeConfig: badgeConfig || {},
        missions: missions || [],
        feedbackBonus: feedbackBonus ?? 50,
      },
    });
    return created(campaign);
  });
