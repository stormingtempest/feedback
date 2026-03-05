import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const userId = req.headers.get('x-user-id');
    const { name, description, questions, badgeConfig, missions, feedbackBonus, status } = await req.json();
    const company = await prisma.company.findFirst({ where: { managerId: userId! } });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const campaign = await prisma.campaign.update({ where: { id, companyId: company.id }, data: { name, description, questions, badgeConfig, missions, feedbackBonus, status } });
    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
