import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: true, campaign: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
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
  } catch {
    return NextResponse.json({ message: 'Error fetching feedbacks' }, { status: 500 });
  }
}
