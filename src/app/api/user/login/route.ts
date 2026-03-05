import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, unauthorized, handle } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    const { username, password } = await req.json();
    if (!username || !password) badRequest('Username and password are required');

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: username }, { name: username }], password },
    });
    if (!user) unauthorized('Invalid credentials');

    return ok({ success: true, role: user!.role, userId: user!.id, companyTag: user!.companyTag });
  });
