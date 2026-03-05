import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const { id } = await params;
    const { name, status, autoApprove } = await req.json();

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (autoApprove !== undefined) data.autoApprove = autoApprove;

    const org = await prisma.company.update({ where: { id }, data });
    return ok(org);
  });
