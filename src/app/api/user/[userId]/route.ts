import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try {
    const { name, description, avatarSeed } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const updateData: Record<string, unknown> = { description, avatarSeed };
    if (name && name !== user.name) {
      const now = new Date();
      if (user.lastNameChange) {
        const daysSince = (now.getTime() - user.lastNameChange.getTime()) / (1000 * 3600 * 24);
        if (daysSince < 30) {
          return NextResponse.json({ message: 'Name can only be changed once every 30 days.' }, { status: 400 });
        }
      }
      updateData.name = name;
      updateData.lastNameChange = now;
    }

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
