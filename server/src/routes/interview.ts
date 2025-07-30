import express from 'express';
import { generateInterviewQuestions } from '../services';
import { validateJobRequirements, validateResumePath } from '../middleware/validation';
import dotenv from 'dotenv';

const router = express.Router();

// POST /api/interview/generate
router.post('/generate', validateJobRequirements, validateResumePath, async (req, res) => {
  try {
    const { jobRequirements, resumePath } = req.body;
    
    if (!jobRequirements) {
      return res.status(400).json({ error: 'Job requirements are required' });
    }
    
    if (!resumePath) {
      return res.status(400).json({ error: 'Resume path is required' });
    }
    
    const cleanedResumePath = resumePath.startsWith('/') ? resumePath.substring(1) : resumePath;
    const interview = await generateInterviewQuestions(jobRequirements, cleanedResumePath);
    
    res.status(200).json({ interview });
  } catch (error) {
    console.error('Interview generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate interview questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const interviewRouter = router;
