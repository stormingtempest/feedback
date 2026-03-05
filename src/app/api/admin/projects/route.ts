import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, created, badRequest, handle, requireRole } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const projects = await prisma.campaign.findMany({ include: { company: true } });
    return ok(projects.map((p) => ({ id: p.id, name: p.name, org: p.company.name, status: p.status, manager: 'Unassigned' })));
  });

export const POST = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const { name, companyId, status } = await req.json();
    if (!name || !companyId) badRequest('Name and companyId are required');

    const project = await prisma.campaign.create({ data: { name, companyId, status: status || 'Active' } });
    return created(project);
  });
