import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, status } = await req.json();
    const project = await prisma.campaign.update({ where: { id }, data: { name, status } });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ message: 'Error updating project' }, { status: 500 });
  }
}
