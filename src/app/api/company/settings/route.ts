import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { aiContext, aiGoals, aiProvider, apiKey, apiModel, name, logoUrl } = await req.json();
    const company = await prisma.company.findFirst({ where: { managerId: userId! } });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const updated = await prisma.company.update({ where: { id: company.id }, data: { aiContext, aiGoals, aiProvider, apiKey, apiModel, name, logoUrl } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
