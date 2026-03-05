import express from 'express';
import { createServer as createViteServer } from 'vite';
import { prisma } from './server/prisma.js';
import { UPLOADS_DIR } from './server/upload.js';

import authRoutes from './server/routes/auth.js';
import userRoutes from './server/routes/user.js';
import feedbackRoutes from './server/routes/feedback.js';
import adminRoutes from './server/routes/admin.js';
import companyRoutes from './server/routes/company.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// --- API Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);

// Helper to seed user data
async function seedUserData(userId: string) {
  // 1. Seed Badges (25 Basic)
  const badgesData = [
    { icon: 'Star', label: 'Beginner', description: 'First feedback sent', color: 'text-pink-400', points: 50 },
    { icon: 'Zap', label: 'Fast', description: 'Feedback in < 5 min', color: 'text-cyan-400', points: 100 },
    { icon: 'Shield', label: 'Elite', description: 'High quality feedback', color: 'text-indigo-400', points: 200 },
    { icon: 'Trophy', label: 'Legend', description: 'Top 1% of users', color: 'text-yellow-400', points: 500 },
    { icon: 'Target', label: 'Precise', description: 'Feedback accepted without changes', color: 'text-emerald-400', points: 300 },
    { icon: 'Bug', label: 'Exterminator', description: 'Found 10 bugs', color: 'text-red-500', points: 150 },
    { icon: 'Eye', label: 'Observer', description: 'Visited 50 screens', color: 'text-blue-400', points: 50 },
    { icon: 'MessageSquare', label: 'Communicative', description: 'Commented on 10 projects', color: 'text-green-400', points: 75 },
    { icon: 'Video', label: 'Filmmaker', description: 'Sent video feedback', color: 'text-purple-400', points: 250 },
    { icon: 'Mic', label: 'Podcaster', description: 'Sent audio feedback', color: 'text-orange-400', points: 200 },
    { icon: 'Smartphone', label: 'Mobile', description: 'Tested on mobile device', color: 'text-teal-400', points: 100 },
    { icon: 'Monitor', label: 'Desktop', description: 'Tested on desktop', color: 'text-gray-400', points: 100 },
    { icon: 'Globe', label: 'Global', description: 'Accessed from 2 countries', color: 'text-indigo-500', points: 500 },
    { icon: 'Clock', label: 'Punctual', description: 'Feedback right after launch', color: 'text-lime-500', points: 150 },
    { icon: 'Calendar', label: 'Daily', description: 'Logged in 7 days in a row', color: 'text-amber-500', points: 300 },
    { icon: 'Heart', label: 'Loved', description: 'Received 5 likes', color: 'text-rose-500', points: 100 },
    { icon: 'Share', label: 'Influencer', description: 'Shared a project', color: 'text-sky-500', points: 150 },
    { icon: 'Lock', label: 'Security', description: 'Reported security flaw', color: 'text-slate-800', points: 1000 },
    { icon: 'Code', label: 'Dev', description: 'Suggested code fix', color: 'text-zinc-600', points: 400 },
    { icon: 'Palette', label: 'Designer', description: 'Suggested UI improvement', color: 'text-fuchsia-500', points: 200 },
    { icon: 'Lightbulb', label: 'Innovator', description: 'Idea implemented', color: 'text-yellow-300', points: 600 },
    { icon: 'Rocket', label: 'Early Adopter', description: 'First to test beta', color: 'text-orange-600', points: 300 },
    { icon: 'Award', label: 'Top Month', description: 'Best of the month', color: 'text-gold-500', points: 800 },
    { icon: 'Crown', label: 'King', description: 'Level 50 reached', color: 'text-yellow-600', points: 2000 },
    { icon: 'Ghost', label: 'Ghost', description: 'Found invisible bug', color: 'text-gray-300', points: 666 },
  ];

  for (const ach of badgesData) {
    const exists = await prisma.achievement.findFirst({ where: { label: ach.label } });
    if (!exists) {
      await prisma.achievement.create({ data: ach });
    }
  }

  const inicianteBadge = await prisma.achievement.findFirst({ where: { label: 'Beginner' } });
  if (inicianteBadge) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: inicianteBadge.id } },
      update: {},
      create: { userId, achievementId: inicianteBadge.id }
    });
  }

  // 2. Seed Missions (25 Basic)
  const missionsData = [
    { title: 'First Access', description: 'Log in to the platform', points: 50 },
    { title: 'Complete Profile', description: 'Fill in all profile data', points: 100 },
    { title: 'Bug Hunter I', description: 'Report your first bug', points: 200 },
    { title: 'Bug Hunter II', description: 'Report 5 bugs', points: 500 },
    { title: 'Bug Hunter III', description: 'Report 10 bugs', points: 1000 },
    { title: 'Constructive Feedback', description: 'Send an improvement suggestion', points: 150 },
    { title: 'Videomaker', description: 'Send video feedback', points: 300 },
    { title: 'Social', description: 'Share an achievement', points: 100 },
    { title: 'Beta Tester', description: 'Participate in a beta test', points: 250 },
    { title: 'Reviewer', description: 'Review 3 projects', points: 150 },
    { title: 'Onboarding', description: 'Complete the initial tutorial', points: 100 },
    { title: 'Daily Streak', description: 'Access 3 days in a row', points: 200 },
    { title: 'Weekly Streak', description: 'Access 7 days in a row', points: 500 },
    { title: 'Explorer', description: 'Visit all dashboard tabs', points: 50 },
    { title: 'Engaged', description: 'Spend 1 hour on the platform', points: 100 },
    { title: 'Quick Draw', description: 'Feedback in < 10min after launch', points: 300 },
    { title: 'Detailed', description: 'Write feedback with > 500 characters', points: 200 },
    { title: 'Multimedia', description: 'Send feedback with image and video', points: 400 },
    { title: 'Mobile First', description: 'Test via mobile', points: 150 },
    { title: 'Cross-Platform', description: 'Test via Tablet', points: 150 },
    { title: 'Accessibility', description: 'Report accessibility issue', points: 300 },
    { title: 'Performance', description: 'Report slowness', points: 200 },
    { title: 'Security', description: 'Report vulnerability', points: 1000 },
    { title: 'Top Contributor', description: 'Be in the top 3 of the weekly ranking', points: 800 },
    { title: 'Ambassador', description: 'Invite a friend (simulated)', points: 500 },
  ];

  for (const mis of missionsData) {
    const exists = await prisma.mission.findFirst({ where: { title: mis.title } });
    if (!exists) {
      await prisma.mission.create({ data: mis });
    }
  }

  const allMissions = await prisma.mission.findMany();
  const userMissions = allMissions.slice(0, 3);
  for (const mission of userMissions) {
    await prisma.userMission.upsert({
      where: { userId_missionId: { userId, missionId: mission.id } },
      update: {},
      create: { userId, missionId: mission.id }
    });
  }

  // 3. Create Company and Campaigns (Projects)
  const company = await prisma.company.findFirst({ where: { name: 'TempestLabs' } });

  if (company) {
    const targetCampaigns = [
      { name: 'Logistics Portal v2', description: 'Project successfully finished.', progress: 100, status: 'Completed' },
      { name: 'Checkout Mobile App', description: 'Not started yet.', progress: 0, status: 'Not Started' },
      { name: 'Dashboard Analytics', description: 'In accelerated development.', progress: 50, status: 'In Progress' },
      { name: 'Design System 2.0', description: 'Final adjustment phase.', progress: 75, status: 'In Progress' },
    ];

    for (const camp of targetCampaigns) {
      const exists = await prisma.campaign.findFirst({ where: { name: camp.name, companyId: company.id } });
      if (!exists) {
        await prisma.campaign.create({
          data: {
            name: camp.name,
            description: camp.description,
            progress: camp.progress,
            status: camp.status,
            companyId: company.id
          }
        });
      } else {
        await prisma.campaign.update({
          where: { id: exists.id },
          data: { progress: camp.progress, status: camp.status }
        });
      }
    }
  }

  // 4. Seed History (Feedbacks)
  const campaigns = await prisma.campaign.findMany({ where: { companyId: company.id } });
  if (campaigns.length > 0) {
    const feedbackData = [
      { category: 'bug', description: 'Login error', status: 'Completed', progress: 100, campaignId: campaigns[0].id },
      { category: 'suggestion', description: 'Improve button color', status: 'In Review', progress: 50, campaignId: campaigns[2].id },
      { category: 'praise', description: 'Great interface', status: 'Pending', progress: 0, campaignId: campaigns[3].id },
    ];

    for (const fb of feedbackData) {
      const exists = await prisma.feedback.findFirst({ 
        where: { userId, description: fb.description } 
      });
      
      if (!exists) {
        await prisma.feedback.create({
          data: {
            category: fb.category,
            description: fb.description,
            status: fb.status,
            progress: fb.progress,
            userId,
            campaignId: fb.campaignId
          }
        });
      }
    }
  }
}

async function seedDatabase() {
  try {
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { role: 'ADMIN', password: 'admin' },
      create: {
        name: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'ADMIN',
      }
    });

    await prisma.user.upsert({
      where: { email: 'moderador@example.com' },
      update: { 
        role: 'MODERATOR', 
        password: 'moderador',
        companyTag: 'moderation' // Added tag as requested
      },
      create: {
        name: 'moderador',
        email: 'moderador@example.com',
        password: 'moderador',
        role: 'MODERATOR',
        companyTag: 'moderation' // Added tag as requested
      }
    });

    const user = await prisma.user.upsert({
      where: { email: 'eusouogiba@example.com' },
      update: { role: 'USER', password: 'user' },
      create: {
        name: 'EuSouOGiba',
        email: 'eusouogiba@example.com',
        password: 'user',
        role: 'USER',
      }
    });
    
    // Check if user has missions to determine if we need to seed user data
    const userMissionsCount = await prisma.userMission.count({ where: { userId: user.id } });
    if (userMissionsCount === 0) {
      // We need to create a dummy company and campaign first to seed feedbacks
      let company = await prisma.company.findFirst({ where: { name: 'TempestLabs' } });
      if (!company) {
        company = await prisma.company.create({ 
          data: { 
            name: 'TempestLabs', 
            tag: 'tempest' 
          } 
        });
      }

      // Create dummy campaigns for the user seed function
      const targetCampaigns = [
        { name: 'Logistics Portal v2', description: 'Project successfully finished.', progress: 100, status: 'Completed' },
        { name: 'Checkout Mobile App', description: 'Not started yet.', progress: 0, status: 'Not Started' },
        { name: 'Dashboard Analytics', description: 'In accelerated development.', progress: 50, status: 'In Progress' },
        { name: 'Design System 2.0', description: 'Final adjustment phase.', progress: 75, status: 'In Progress' },
      ];

      for (const camp of targetCampaigns) {
        const exists = await prisma.campaign.findFirst({ where: { name: camp.name, companyId: company.id } });
        if (!exists) {
          await prisma.campaign.create({
            data: {
              name: camp.name,
              description: camp.description,
              progress: camp.progress,
              status: camp.status,
              companyId: company.id
            }
          });
        }
      }

      // Now we can seed user data (badges, missions, feedbacks)
      // We need to manually inline the logic because seedUserData was relying on existing campaigns
      
      // 1. Seed Badges
      const badgesData = [
        { icon: 'Star', label: 'Beginner', description: 'First feedback sent', color: 'text-pink-400', points: 50 },
        { icon: 'Zap', label: 'Fast', description: 'Feedback in < 5 min', color: 'text-cyan-400', points: 100 },
        { icon: 'Shield', label: 'Elite', description: 'High quality feedback', color: 'text-indigo-400', points: 200 },
        { icon: 'Trophy', label: 'Legend', description: 'Top 1% of users', color: 'text-yellow-400', points: 500 },
        { icon: 'Target', label: 'Precise', description: 'Feedback accepted without changes', color: 'text-emerald-400', points: 300 },
      ];
    
      for (const ach of badgesData) {
        const exists = await prisma.achievement.findFirst({ where: { label: ach.label } });
        if (!exists) {
          await prisma.achievement.create({ data: ach });
        }
      }

      // 2. Seed Missions
      const missionsData = [
        { title: 'First Access', description: 'Log in to the platform', points: 50 },
        { title: 'Complete Profile', description: 'Fill in all profile data', points: 100 },
        { title: 'Bug Hunter I', description: 'Report your first bug', points: 200 },
      ];
    
      for (const mis of missionsData) {
        const exists = await prisma.mission.findFirst({ where: { title: mis.title } });
        if (!exists) {
          await prisma.mission.create({ data: mis });
        }
      }

      // Assign missions to user
      const allMissions = await prisma.mission.findMany();
      for (const mission of allMissions) {
        await prisma.userMission.upsert({
          where: { userId_missionId: { userId: user.id, missionId: mission.id } },
          update: {},
          create: { userId: user.id, missionId: mission.id }
        });
      }
    }

    console.log('Seeding database...');
    const empresaUser = await prisma.user.upsert({
      where: { email: 'empresa1@example.com' },
      update: { role: 'COMPANY', password: 'empresa1', companyTag: 'tempest' },
      create: {
        name: 'empresa1',
        email: 'empresa1@example.com',
        password: 'empresa1',
        role: 'COMPANY',
        companyTag: 'tempest',
      }
    });

    let company = await prisma.company.findFirst({ where: { name: 'TempestLabs' } });
    if (!company) {
      company = await prisma.company.create({ data: { name: 'TempestLabs', tag: 'tempest', managerId: empresaUser.id } });
    } else {
      await prisma.company.update({ where: { id: company.id }, data: { tag: 'tempest', managerId: empresaUser.id } });
    }

    // Create Projects and Feedbacks for Company Dashboard
    const projects = ['Projeto A', 'Projeto B', 'Projeto C'];
    for (const p of projects) {
      let proj = await prisma.project.findFirst({ where: { name: p, companyId: company.id } });
      if (!proj) {
        proj = await prisma.project.create({
          data: { name: p, description: `Descrição do ${p}`, companyId: company.id }
        });
      }
      
      // Create a campaign for this project to attach feedbacks to
      const campName = `Campanha ${p}`;
      let camp = await prisma.campaign.findFirst({ where: { name: campName, companyId: company.id } });
      if (!camp) {
        camp = await prisma.campaign.create({
          data: { name: campName, companyId: company.id, projectId: proj.id, status: 'Active' }
        });
      }

      // Add feedbacks
      const feedbackCount = await prisma.feedback.count({ where: { campaignId: camp.id } });
      if (feedbackCount < 4) {
        for (let i = 0; i < 4; i++) {
           await prisma.feedback.create({
            data: {
              category: i % 2 === 0 ? 'Gameplay' : 'UI/UX',
              description: `Feedback ${i} para ${p}`,
              status: 'Pending',
              moderationStatus: 'Pending',
              internalRating: Math.floor(Math.random() * 5) + 1,
              userId: user.id, // Use the 'EuSouOGiba' user
              campaignId: camp.id,
              createdAt: new Date(Date.now() - (i * 86400000 * 2)), // Alternating days
            }
          });
        }
      }
    }
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

async function startServer() {
  await seedDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
