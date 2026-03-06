import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ok, badRequest, handle, getAuthUser } from '@/lib/api';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const POINTS_BASE = 150;
const POINTS_PER_FILE = 50;

const VALID_CATEGORIES = ['bug', 'praise', 'suggestion', 'question'];

export const GET = (req: NextRequest) =>
  handle(async () => {
    const authUser = await getAuthUser(req);
    const campaignId = req.nextUrl.searchParams.get('campaignId');
    if (!campaignId) badRequest('campaignId required');
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: authUser.id, campaignId: campaignId! },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        category: true,
        description: true,
        moderationStatus: true,
        files: true,
        link: true,
        companyResponse: true,
        createdAt: true,
      },
    });
    const result = feedbacks.map((f) => ({
      ...f,
      files: Array.isArray(f.files) ? (f.files as string[]) : [],
      createdAt: f.createdAt.toISOString(),
    }));
    return NextResponse.json(result);
  });

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
    if (!VALID_CATEGORIES.includes(category)) badRequest('Invalid category');
    if (description.trim().length < 10) badRequest('Description must be at least 10 characters');

    const files = formData.getAll('files') as File[];
    if (files.length > MAX_FILES) badRequest(`Maximum ${MAX_FILES} files allowed`);

    const fileUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) badRequest(`File type not allowed: ${file.name}. Use PNG, JPG or WebP.`);
      if (file.size > MAX_FILE_SIZE) badRequest(`File too large: ${file.name}. Maximum 5MB.`);

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
      data: { userId: authUser.id, campaignId, category, description, link, ratings: parsedRatings, files: fileUrls },
    });

    const totalPoints = POINTS_BASE + fileUrls.length * POINTS_PER_FILE;
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
