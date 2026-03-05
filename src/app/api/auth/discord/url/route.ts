import { NextRequest, NextResponse } from 'next/server';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

export async function GET(req: NextRequest) {
  const baseUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
  const redirectUri = `${baseUrl}/api/auth/discord/callback`;
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
  });
  return NextResponse.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
}
