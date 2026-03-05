import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, created, badRequest, handle, requireRole } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const orgs = await prisma.company.findMany({ include: { _count: { select: { campaigns: true } } } });
    return ok(orgs.map((o) => ({ id: o.id, name: o.name, projects: o._count.campaigns, status: o.status, autoApprove: o.autoApprove })));
  });

export const POST = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');
    const { name, status, managerName, managerEmail, managerPassword } = await req.json();
    if (!name) badRequest('Name is required');

    let managerId: string | null = null;
    if (managerEmail && managerPassword) {
      const existing = await prisma.user.findUnique({ where: { email: managerEmail } });
      if (existing) {
        managerId = existing.id;
      } else {
        const newUser = await prisma.user.create({
          data: { name: managerName || 'Manager', email: managerEmail, password: managerPassword, role: 'COMPANY' },
        });
        managerId = newUser.id;
      }
    }

    const org = await prisma.company.create({ data: { name, status: status || 'Active', managerId } });
    return created(org);
  });
