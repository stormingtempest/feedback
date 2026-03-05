import express from 'express';
import { prisma } from '../prisma.js';
import { upload } from '../upload.js';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();

// --- Feedback Submission Endpoint ---
router.post('/', upload.array('files'), async (req, res) => {
  const { userId, campaignId, category, description, link, ratings } = req.body;
  
  if (!userId || !campaignId || !category || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const fileUrls = uploadedFiles.map(file => `/uploads/${file.filename}`);

    let parsedRatings = ratings;
    if (typeof ratings === 'string') {
      try {
        parsedRatings = JSON.parse(ratings);
      } catch (e) {
        console.error('Error parsing ratings JSON:', e);
        parsedRatings = {};
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        campaignId,
        category,
        description,
        link,
        ratings: typeof parsedRatings === 'string' ? parsedRatings : JSON.stringify(parsedRatings),
        files: JSON.stringify(fileUrls),
        status: 'Pending',
        progress: 100
      }
    });

    const POINTS_PER_FEEDBACK = 150;
    const BONUS_PER_FILE = 50;
    const totalPoints = POINTS_PER_FEEDBACK + (fileUrls.length * BONUS_PER_FILE);

    await prisma.user.update({
      where: { id: userId },
      data: { 
        points: { increment: totalPoints },
      }
    });

    const firstFeedbackMission = await prisma.mission.findFirst({ where: { title: 'Constructive Feedback' } });
    if (firstFeedbackMission) {
      await prisma.userMission.upsert({
        where: { userId_missionId: { userId, missionId: firstFeedbackMission.id } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, missionId: firstFeedbackMission.id, completed: true, completedAt: new Date() }
      });
    }

    res.json({ success: true, feedback, pointsEarned: totalPoints });
  } catch (error) {
    console.error('Feedback Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// --- Transcription Endpoint ---
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file provided' });
  }

  const apiKey = process.env.OPENAI_WHISPER_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_WHISPER_API_KEY is missing');
    return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
  }

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(req.file.path);
    
    formData.append('file', fileStream, {
      filename: 'audio.webm', 
      contentType: req.file.mimetype,
    });
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp audio file:', err);
    });

    res.json({ text: response.data.text });
  } catch (error: any) {
    console.error('Transcription error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Transcription failed', details: error.response?.data });
  }
});

export default router;
