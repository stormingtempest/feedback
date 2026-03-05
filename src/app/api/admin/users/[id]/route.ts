import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const { id } = await params;
    const { role, status } = await req.json();

    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (status) data.status = status;

    const user = await prisma.user.update({ where: { id }, data });
    return ok(user);
  });
