import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { name: username }],
        password: password,
      },
    });
    if (user) {
      return NextResponse.json({ success: true, role: user.role, userId: user.id, companyTag: user.companyTag });
    }
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
