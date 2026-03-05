import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ok, badRequest, handle, getAuthUser } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    const authUser = await getAuthUser(req);
    const formData = await req.formData();

    const campaignId = formData.get('campaignId') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const link = formData.get('link') as string | null;
    const ratingsRaw = formData.get('ratings') as string | null;

    if (!campaignId || !category || !description) badRequest('Missing required fields');

    const files = formData.getAll('files') as File[];
    const fileUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      fileUrls.push(`/uploads/${filename}`);
    }

    let parsedRatings: Record<string, number> = {};
    if (ratingsRaw) {
      try { parsedRatings = JSON.parse(ratingsRaw); } catch { parsedRatings = {}; }
    }

    const feedback = await prisma.feedback.create({
      data: { userId: authUser.id, campaignId, category, description, link, ratings: parsedRatings, files: fileUrls, status: 'Pending', progress: 100 },
    });

    const totalPoints = 150 + fileUrls.length * 50;
    await prisma.user.update({ where: { id: authUser.id }, data: { points: { increment: totalPoints } } });

    const mission = await prisma.mission.findFirst({ where: { title: 'Constructive Feedback' } });
    if (mission) {
      await prisma.userMission.upsert({
        where: { userId_missionId: { userId: authUser.id, missionId: mission.id } },
        update: { completed: true, completedAt: new Date() },
        create: { userId: authUser.id, missionId: mission.id, completed: true, completedAt: new Date() },
      });
    }

    return ok({ success: true, feedback, pointsEarned: totalPoints });
  });
