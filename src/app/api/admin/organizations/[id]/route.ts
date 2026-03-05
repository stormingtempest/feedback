import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, status, autoApprove } = await req.json();
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (autoApprove !== undefined) data.autoApprove = autoApprove;
    const org = await prisma.company.update({ where: { id }, data });
    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ message: 'Error updating organization' }, { status: 500 });
  }
}
