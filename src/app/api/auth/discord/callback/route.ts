import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return new NextResponse('No code provided', { status: 400 });

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new NextResponse('Server configuration error', { status: 500 });

  try {
    const baseUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
    const redirectUri = `${baseUrl}/api/auth/discord/callback`;

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    });
    const { access_token } = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { id: discordId, email, username, avatar } = await userRes.json();
    const avatarUrl = avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : null;

    let user = await prisma.user.findFirst({ where: { OR: [{ discordId }, { email }] } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name: username, avatarSeed: avatarUrl, discordId, role: 'USER' } });
    } else if (!user.discordId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { discordId, avatarSeed: avatarUrl || user.avatarSeed } });
    }

    const safeUserId = encodeURIComponent(user.id);
    const safeRole = encodeURIComponent(user.role);
    return new NextResponse(
      `<html><body><script>if(window.opener){window.opener.postMessage({type:'OAUTH_AUTH_SUCCESS',userId:'${safeUserId}',role:'${safeRole}'},'${process.env.APP_URL || ''}');window.close();}else{window.location.href='/'}</script><p>Authentication successful.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Discord OAuth Error:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
