import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    return ok(users);
  });
