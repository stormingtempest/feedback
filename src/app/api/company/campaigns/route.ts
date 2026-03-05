import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { name, description, projectId, questions, badgeConfig, missions, feedbackBonus } = await req.json();
    const company = await prisma.company.findFirst({ where: { managerId: userId! } });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const campaign = await prisma.campaign.create({
      data: { name, description, companyId: company.id, projectId: projectId || null, questions: questions || [], badgeConfig: badgeConfig || {}, missions: missions || [], feedbackBonus: feedbackBonus || 50 },
    });
    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
