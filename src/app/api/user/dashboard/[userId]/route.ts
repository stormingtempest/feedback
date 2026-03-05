import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: { include: { achievement: true } },
        missions: { include: { mission: true } },
        feedbacks: { include: { campaign: true } },
      },
    });
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const campaigns = await prisma.campaign.findMany({ take: 4, orderBy: { createdAt: 'desc' } });

    return NextResponse.json({
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
        achievements: user.achievements.map((ua) => ({
          id: ua.achievement.id,
          icon: ua.achievement.icon,
          label: ua.achievement.label,
          color: ua.achievement.color,
          description: ua.achievement.description,
          unlocked: true,
        })),
        missions: user.missions.map((um) => ({
          id: um.mission.id,
          title: um.mission.title,
          description: um.mission.description,
          points: um.mission.points,
          completed: um.completed,
        })),
      },
      activeProjects: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        progress: c.progress,
      })),
      history: user.feedbacks.map((f) => ({
        id: f.id,
        projectName: f.campaign.name,
        date: f.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: f.status,
        progress: f.progress,
        description: f.description,
        points: 150,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
