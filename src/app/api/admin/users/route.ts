import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, status: true } });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}
