import express from 'express';
import axios from 'axios';
import { prisma } from '../prisma.js';

const router = express.Router();

// --- OAuth Configuration ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_REMOVED';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_REMOVED';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1477699505024401580';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'rRObEjO_ZSalDkqnua7u4tpU37FUXQt4';

const getRedirectUri = (req: express.Request, provider: 'google' | 'discord') => {
  const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;
  return `${baseUrl}/api/auth/${provider}/callback`;
};

// Google Auth URL
router.get('/google/url', (req, res) => {
  const redirectUri = getRedirectUri(req, 'google');
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent'
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

// Google Callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const redirectUri = getRedirectUri(req, 'google');
    
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id: googleId, email, name, picture } = userRes.data;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarSeed: picture,
          googleId,
          role: 'USER',
        }
      });
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', userId: '${user.id}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Google OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// Discord Auth URL
router.get('/discord/url', (req, res) => {
  const redirectUri = getRedirectUri(req, 'discord');
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email'
  });
  res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` });
});

// Discord Callback
router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const redirectUri = getRedirectUri(req, 'discord');
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: redirectUri
    });

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id: discordId, email, username, avatar } = userRes.data;
    
    const avatarUrl = avatar 
      ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` 
      : null;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: username,
          avatarSeed: avatarUrl,
          discordId,
          role: 'USER',
        }
      });
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', userId: '${user.id}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Discord OAuth Error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

export default router;
