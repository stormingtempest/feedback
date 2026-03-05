import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const moderator = await requireRole(req, 'ADMIN', 'MODERATOR');
    const { id } = await params;
    const { status, internalRating, internalTags, internalComment, internalOtherJustification } = await req.json();
    if (!status) badRequest('Status is required');

    const data: Record<string, unknown> = { moderationStatus: status, moderatedBy: moderator.id };
    if (internalRating !== undefined) data.internalRating = internalRating;
    if (internalTags !== undefined) data.internalTags = internalTags;
    if (internalComment !== undefined) data.internalComment = internalComment;
    if (internalOtherJustification !== undefined) data.internalOtherJustification = internalOtherJustification;

    const feedback = await prisma.feedback.update({ where: { id }, data });
    return ok(feedback);
  });
