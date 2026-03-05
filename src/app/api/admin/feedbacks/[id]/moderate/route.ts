import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { status, internalRating, internalTags, internalComment, internalOtherJustification } = await req.json();
    const data: Record<string, unknown> = { moderationStatus: status };
    if (internalRating !== undefined) data.internalRating = internalRating;
    if (internalTags !== undefined) data.internalTags = internalTags;
    if (internalComment !== undefined) data.internalComment = internalComment;
    if (internalOtherJustification !== undefined) data.internalOtherJustification = internalOtherJustification;
    const feedback = await prisma.feedback.update({ where: { id }, data });
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ message: 'Error moderating feedback' }, { status: 500 });
  }
}
