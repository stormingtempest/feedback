import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, handle, requireRole } from '@/lib/api';

const VALID_STATUSES = ['Pending', 'Approved', 'Rejected'];
const VALID_TAGS = ['Bug Crítico', 'Alta Prioridade', 'Dado duplicado', 'Usuário Confiável', 'Requer investigação', 'Outros'];

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const moderator = await requireRole(req, 'ADMIN', 'MODERATOR');
    const { id } = await params;
    const { status, internalRating, internalTags, internalComment, internalOtherJustification } = await req.json();

    if (!status) badRequest('Status is required');
    if (!VALID_STATUSES.includes(status)) badRequest(`Status must be one of: ${VALID_STATUSES.join(', ')}`);

    if (status !== 'Pending') {
      if (!internalRating || internalRating < 1 || internalRating > 5) badRequest('Internal rating (1–5) is required when approving or rejecting');
    }

    if (internalTags !== undefined) {
      if (!Array.isArray(internalTags)) badRequest('internalTags must be an array');
      const invalidTags = internalTags.filter((t: string) => !VALID_TAGS.includes(t));
      if (invalidTags.length > 0) badRequest(`Invalid tags: ${invalidTags.join(', ')}`);
      if (internalTags.includes('Outros') && !internalOtherJustification?.trim()) {
        badRequest('Justification is required when tag "Outros" is selected');
      }
    }

    const data: Record<string, unknown> = { moderationStatus: status, moderatedBy: moderator.id };
    if (internalRating !== undefined) data.internalRating = internalRating;
    if (internalTags !== undefined) data.internalTags = internalTags;
    if (internalComment !== undefined) data.internalComment = internalComment;
    if (internalOtherJustification !== undefined) data.internalOtherJustification = internalOtherJustification;

    const feedback = await prisma.feedback.update({ where: { id }, data });
    return ok(feedback);
  });
