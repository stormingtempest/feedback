import express from 'express';
import { prisma } from '../prisma.js';

const router = express.Router();

// Leveling Logic
const getNextLevelPoints = (level: number) => {
  if (level < 15) return 1000;
  if (level < 35) return 2500;
  if (level < 50) return 3500;
  return 5000;
};

const TITLES = [
  "Iniciante", "Observador", "Explorador", "Aprendiz", "Participante",
  "Colaborador", "Analista Jr", "Analista", "Analista Sr", "Crítico",
  "Inspetor", "Investigador", "Detetive de Bugs", "Caçador de Falhas", "Especialista",
  "Consultor", "Auditor", "Visionário", "Arquiteto de Ideias", "Engenheiro de Feedback",
  "Mestre da Usabilidade", "Guru da UX", "Sábio do Design", "Oráculo", "Lenda",
  "Mítico", "Imortal", "Divindade do Feedback", "Onisciente", "Transcendental",
  "Guardião da Qualidade", "Supremo", "Feedback Master"
];

const getTitleForLevel = (level: number) => {
  const index = Math.floor(level / 3);
  return TITLES[Math.min(index, TITLES.length - 1)];
};

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    console.log('Login attempt for:', username);
    const userByEmail = await prisma.user.findUnique({ where: { email: username } });
    const userByName = await prisma.user.findFirst({ where: { name: username } });
    
    console.log('User found by email:', userByEmail ? 'Yes' : 'No');
    console.log('User found by name:', userByName ? 'Yes' : 'No');
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ],
        password: password
      }
    });
    console.log('User found with password:', user ? 'Yes' : 'No');

    if (user) {
      console.log('Login successful for:', user.name, 'Role:', user.role);
      return res.json({ 
        success: true, 
        role: user.role, 
        userId: user.id,
        companyTag: user.companyTag // Include tag in response
      });
    }
    
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

// Upgrade Request Endpoint
router.post('/upgrade-request', async (req, res) => {
  const { userId, companyName, businessType, reason, telegram, whatsapp } = req.body;

  if (!userId || !companyName || !businessType || !reason) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const request = await prisma.upgradeRequest.create({
      data: {
        userId,
        companyName,
        businessType,
        reason,
        telegram,
        whatsapp
      }
    });
    res.json({ success: true, request });
  } catch (error) {
    console.error('Upgrade Request Error:', error);
    res.status(500).json({ message: 'Failed to submit request' });
  }
});

// Dashboard Data
router.get('/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: { include: { achievement: true } },
        missions: { include: { mission: true } },
        feedbacks: { include: { campaign: true } }
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        levelTitle: user.levelTitle,
        points: user.points,
        nextLevelPoints: user.nextLevelPoints,
        description: user.description || '',
        avatarSeed: user.avatarSeed || user.name,
        lastNameChange: user.lastNameChange,
        googleId: user.googleId,
        discordId: user.discordId,
        achievements: user.achievements.map(ua => ({
          id: ua.achievement.id,
          icon: ua.achievement.icon,
          label: ua.achievement.label,
          color: ua.achievement.color,
          description: ua.achievement.description,
          unlocked: true
        })),
        missions: user.missions.map(um => ({
          id: um.mission.id,
          title: um.mission.title,
          description: um.mission.description,
          points: um.mission.points,
          completed: um.completed
        }))
      },
      activeProjects: [] as any[],
      history: user.feedbacks.map(f => ({
        id: f.id,
        projectName: f.campaign.name,
        date: f.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: f.status,
        progress: f.progress,
        description: f.description,
        points: 150
      }))
    };

    const campaigns = await prisma.campaign.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
    
    dashboardData.activeProjects = campaigns.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      progress: c.progress
    }));

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update User Profile
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, description, avatarSeed } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData: any = { description, avatarSeed };

    if (name && name !== user.name) {
      const now = new Date();
      if (user.lastNameChange) {
        const daysSinceChange = (now.getTime() - user.lastNameChange.getTime()) / (1000 * 3600 * 24);
        if (daysSinceChange < 30) {
          return res.status(400).json({ message: 'Name can only be changed once every 30 days.' });
        }
      }
      updateData.name = name;
      updateData.lastNameChange = now;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
