import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseInterviewAssessmentPDF, calculateCandidateScores } from '../services/interviewAssessmentParser';
import { validateComparisonRequest } from '../middleware/validation';

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/assessments');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const candidateId = req.body.candidateId || 'unknown';
    cb(null, `assessment-${candidateId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * Upload candidate Interview Assessment PDF and extract data
 */
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const { candidateId } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    console.log('Processing interview assessment PDF:', req.file.path);

    // Parse the interview assessment PDF
    const assessment = await parseInterviewAssessmentPDF(req.file.path);
    
    console.log('Extracted assessment data:', {
      candidateName: assessment.candidateName,
      totalQuestions: assessment.questions.length,
      averageRating: assessment.averageRating
    });

    res.json({
      success: true,
      data: {
        interviewAssessment: assessment,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload and process Interview Assessment PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Analyze and compare candidates based on interview assessments
 */
router.post('/analyze', validateComparisonRequest, async (req, res) => {
  try {
    const { criteria, candidates } = req.body;

    if (!candidates || candidates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 candidates are required for comparison'
      });
    }

    console.log('Analyzing candidates based on interview assessments...');
    
    // Process each candidate's interview assessment
    const analysisResults = [];
    
    for (const candidate of candidates) {
      if (!candidate.interviewAssessment) {
        throw new Error(`Interview assessment missing for candidate ${candidate.name}`);
      }

      // Calculate scores based on interview performance
      const scores = calculateCandidateScores(candidate.interviewAssessment);
      
      analysisResults.push({
        candidateId: candidate.id,
        scores
      });
    }

    console.log(`Successfully analyzed ${analysisResults.length} candidates`);

    res.json({
      success: true,
      data: {
        results: analysisResults
      }
    });

  } catch (error) {
    console.error('Candidate analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze candidates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate comparison report
 */
router.post('/:comparisonId/report', async (req, res) => {
  try {
    const { comparisonId } = req.params;

    // Mock report generation
    const reportUrl = `/api/comparison/${comparisonId}/report.pdf`;

    res.json({
      success: true,
      data: {
        reportUrl
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate comparison report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as comparisonRouter };
