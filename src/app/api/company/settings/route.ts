import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, notFound, handle, requireRole } from '@/lib/api';

export const PUT = (req: NextRequest) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { aiContext, aiGoals, aiProvider, apiKey, apiModel, name, logoUrl } = await req.json();

    const company = await prisma.company.findFirst({ where: { managerId: user.id } });
    if (!company) notFound('Company not found');

    const updated = await prisma.company.update({
      where: { id: company!.id },
      data: { aiContext, aiGoals, aiProvider, apiKey, apiModel, name, logoUrl },
    });
    return ok(updated);
  });
