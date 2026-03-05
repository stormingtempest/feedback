import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orgs = await prisma.company.findMany({ include: { _count: { select: { campaigns: true } } } });
    return NextResponse.json(orgs.map((o) => ({ id: o.id, name: o.name, projects: o._count.campaigns, status: o.status, autoApprove: o.autoApprove })));
  } catch {
    return NextResponse.json({ message: 'Error fetching organizations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, status, managerName, managerEmail, managerPassword } = await req.json();
    let managerId: string | null = null;
    if (managerEmail && managerPassword) {
      const existing = await prisma.user.findUnique({ where: { email: managerEmail } });
      if (existing) {
        managerId = existing.id;
      } else {
        const newUser = await prisma.user.create({ data: { name: managerName || 'Manager', email: managerEmail, password: managerPassword, role: 'COMPANY' } });
        managerId = newUser.id;
      }
    }
    const org = await prisma.company.create({ data: { name, status: status || 'Active', managerId } });
    return NextResponse.json(org);
  } catch {
    return NextResponse.json({ message: 'Error creating organization' }, { status: 500 });
  }
}
