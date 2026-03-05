import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return new NextResponse('No code provided', { status: 400 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new NextResponse('Server configuration error', { status: 500 });

  try {
    const baseUrl = process.env.APP_URL || `https://${req.headers.get('host')}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    const { access_token } = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { id: googleId, email, name, picture } = await userRes.json();

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name, avatarSeed: picture, googleId, role: 'USER' } });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId, avatarSeed: picture || user.avatarSeed } });
    }

    const safeUserId = encodeURIComponent(user.id);
    const safeRole = encodeURIComponent(user.role);
    return new NextResponse(
      `<html><body><script>if(window.opener){window.opener.postMessage({type:'OAUTH_AUTH_SUCCESS',userId:'${safeUserId}',role:'${safeRole}'},'${process.env.APP_URL || ''}');window.close();}else{window.location.href='/'}</script><p>Authentication successful.</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
