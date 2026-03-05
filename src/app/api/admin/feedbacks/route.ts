import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN', 'MODERATOR');

    const feedbacks = await prisma.feedback.findMany({
      include: { user: true, campaign: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return ok(
      feedbacks.map((f) => ({
        id: f.id,
        user: f.user.name,
        project: f.campaign.name,
        companyId: f.campaign.companyId,
        companyName: f.campaign.company.name,
        content: f.description,
        status: f.moderationStatus.toLowerCase(),
        date: f.createdAt.toISOString().split('T')[0],
        ratings: f.ratings,
        files: f.files,
        link: f.link,
        internalRating: f.internalRating,
        internalTags: f.internalTags,
        internalComment: f.internalComment,
        internalOtherJustification: f.internalOtherJustification,
      }))
    );
  });
