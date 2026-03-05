import { NextRequest } from 'next/server';
import { ok, handle } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');

    const baseUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      prompt: 'consent',
    });
    return ok({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });
