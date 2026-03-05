import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, notFound, forbidden, handle, getAuthUser } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ userId: string }> }) =>
  handle(async () => {
    const authUser = await getAuthUser(req);
    const { userId } = await params;

    if (authUser.id !== userId && authUser.role !== 'ADMIN') forbidden('Cannot update another user\'s profile');

    const { name, description, avatarSeed } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) notFound('User not found');

    const updateData: Record<string, unknown> = { description, avatarSeed };
    if (name && name !== user!.name) {
      const now = new Date();
      if (user!.lastNameChange) {
        const daysSince = (now.getTime() - user!.lastNameChange.getTime()) / (1000 * 3600 * 24);
        if (daysSince < 30) badRequest('Name can only be changed once every 30 days');
      }
      updateData.name = name;
      updateData.lastNameChange = now;
    }

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    return ok({ success: true, user: updatedUser });
  });
