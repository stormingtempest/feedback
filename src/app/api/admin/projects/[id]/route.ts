import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const { id } = await params;
    const { name, status } = await req.json();
    const project = await prisma.campaign.update({ where: { id }, data: { name, status } });
    return ok(project);
  });
