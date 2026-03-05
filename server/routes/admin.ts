import express from 'express';
import { prisma } from '../prisma.js';

const router = express.Router();

// Get Admin Stats
router.get('/stats', async (req, res) => {
  try {
    const orgCount = await prisma.company.count();
    const projectCount = await prisma.campaign.count();
    const userCount = await prisma.user.count();
    const managerCount = await prisma.user.count({ where: { role: 'MANAGER' } });
    const moderatorCount = await prisma.user.count({ where: { role: 'MODERATOR' } });
    
    const pendingFeedbacks = await prisma.feedback.count({ where: { moderationStatus: 'Pending' } });
    const approvedFeedbacks = await prisma.feedback.count({ where: { moderationStatus: 'Approved' } });
    const rejectedFeedbacks = await prisma.feedback.count({ where: { moderationStatus: 'Rejected' } });
    const totalFeedbacks = await prisma.feedback.count();

    res.json({
      organizations: orgCount,
      projects: projectCount,
      users: userCount,
      managers: managerCount,
      moderators: moderatorCount,
      moderation: {
        pending: pendingFeedbacks,
        approved: approvedFeedbacks,
        rejected: rejectedFeedbacks,
        total: totalFeedbacks
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Organizations
router.get('/organizations', async (req, res) => {
  try {
    const orgs = await prisma.company.findMany({
      include: { _count: { select: { campaigns: true } } }
    });
    res.json(orgs.map(o => ({ id: o.id, name: o.name, projects: o._count.campaigns, status: o.status, autoApprove: o.autoApprove })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations' });
  }
});

router.post('/organizations', async (req, res) => {
  try {
    const { name, status, managerName, managerEmail, managerPassword } = req.body;
    
    let managerId = null;
    if (managerEmail && managerPassword) {
      const existingUser = await prisma.user.findUnique({ where: { email: managerEmail } });
      if (existingUser) {
        managerId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            name: managerName || 'Manager',
            email: managerEmail,
            password: managerPassword,
            role: 'COMPANY'
          }
        });
        managerId = newUser.id;
      }
    }

    const org = await prisma.company.create({ 
      data: { 
        name, 
        status: status || 'Active',
        managerId
      } 
    });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error creating organization' });
  }
});

router.put('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, autoApprove } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (autoApprove !== undefined) data.autoApprove = autoApprove;

    const org = await prisma.company.update({
      where: { id },
      data
    });
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization' });
  }
});

// Projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.campaign.findMany({
      include: { company: true }
    });
    res.json(projects.map(p => ({
      id: p.id,
      name: p.name,
      org: p.company.name,
      status: p.status,
      manager: 'Unassigned'
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, companyId, status } = req.body;
    const project = await prisma.campaign.create({
      data: { name, companyId, status: status || 'Active' }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const project = await prisma.campaign.update({
      where: { id },
      data: { name, status }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Moderation
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { 
        user: true, 
        campaign: {
          include: { company: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks.map(f => ({
      id: f.id,
      user: f.user.name,
      project: f.campaign.name,
      companyId: f.campaign.companyId,
      companyName: f.campaign.company.name,
      content: f.description,
      status: f.moderationStatus.toLowerCase(),
      date: f.createdAt.toISOString().split('T')[0],
      ratings: f.ratings,
      files: f.files,
      link: f.link,
      internalRating: f.internalRating,
      internalTags: f.internalTags,
      internalComment: f.internalComment,
      internalOtherJustification: f.internalOtherJustification
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks' });
  }
});

router.put('/feedbacks/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, internalRating, internalTags, internalComment, internalOtherJustification } = req.body;
    
    const data: any = { moderationStatus: status };
    if (internalRating !== undefined) data.internalRating = internalRating;
    if (internalTags !== undefined) data.internalTags = internalTags;
    if (internalComment !== undefined) data.internalComment = internalComment;
    if (internalOtherJustification !== undefined) data.internalOtherJustification = internalOtherJustification;

    const feedback = await prisma.feedback.update({
      where: { id },
      data
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error moderating feedback' });
  }
});

export default router;
