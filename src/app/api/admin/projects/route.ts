import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.campaign.findMany({ include: { company: true } });
    return NextResponse.json(projects.map((p) => ({ id: p.id, name: p.name, org: p.company.name, status: p.status, manager: 'Unassigned' })));
  } catch {
    return NextResponse.json({ message: 'Error fetching projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, companyId, status } = await req.json();
    const project = await prisma.campaign.create({ data: { name, companyId, status: status || 'Active' } });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ message: 'Error creating project' }, { status: 500 });
  }
}
