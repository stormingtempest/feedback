import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { role, status } = await req.json();
    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (status) data.status = status;
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
