import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, badRequest, handle, getAuthUser } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    const user = await getAuthUser(req);
    const { companyName, businessType, reason, telegram, whatsapp } = await req.json();
    if (!companyName || !businessType || !reason) badRequest('Missing required fields');

    const request = await prisma.upgradeRequest.create({
      data: { userId: user.id, companyName, businessType, reason, telegram, whatsapp },
    });
    return ok({ success: true, request });
  });
