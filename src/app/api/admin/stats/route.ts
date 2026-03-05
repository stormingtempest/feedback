import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, handle, requireRole } from '@/lib/api';

export const GET = (req: NextRequest) =>
  handle(async () => {
    await requireRole(req, 'ADMIN');

    const [
      orgCount, projectCount, userCount, managerCount, moderatorCount,
      pendingFeedbacks, approvedFeedbacks, rejectedFeedbacks, totalFeedbacks,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.campaign.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.feedback.count({ where: { moderationStatus: 'Pending' } }),
      prisma.feedback.count({ where: { moderationStatus: 'Approved' } }),
      prisma.feedback.count({ where: { moderationStatus: 'Rejected' } }),
      prisma.feedback.count(),
    ]);

    return ok({
      organizations: orgCount,
      projects: projectCount,
      users: userCount,
      managers: managerCount,
      moderators: moderatorCount,
      moderation: { pending: pendingFeedbacks, approved: approvedFeedbacks, rejected: rejectedFeedbacks, total: totalFeedbacks },
    });
  });
