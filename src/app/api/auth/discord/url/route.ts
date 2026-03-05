import { NextRequest } from 'next/server';
import { ok, handle } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) throw new Error('DISCORD_CLIENT_ID not configured');

    const baseUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
    const redirectUri = `${baseUrl}/api/auth/discord/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
    });
    return ok({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
  });
