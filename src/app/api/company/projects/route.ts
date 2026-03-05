import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { name, description } = await req.json();
    const company = await prisma.company.findFirst({ where: { managerId: userId! } });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const project = await prisma.project.create({ data: { name, description, companyId: company.id } });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
