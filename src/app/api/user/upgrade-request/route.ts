import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, companyName, businessType, reason, telegram, whatsapp } = await req.json();
    if (!userId || !companyName || !businessType || !reason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const request = await prisma.upgradeRequest.create({
      data: { userId, companyName, businessType, reason, telegram, whatsapp },
    });
    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Upgrade Request Error:', error);
    return NextResponse.json({ message: 'Failed to submit request' }, { status: 500 });
  }
}
