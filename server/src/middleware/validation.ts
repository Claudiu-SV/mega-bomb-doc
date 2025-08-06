import { NextFunction, Request, Response } from 'express';

import { AppError } from './errorHandler';

/**
 * Validate job requirements request body
 */
export const validateJobRequirements = (req: Request, res: Response, next: NextFunction) => {
  const { jobRequirements } = req.body;
  
  if (!jobRequirements) {
    return next(new AppError('Job requirements are required', 400));
  }
  
  if (!jobRequirements.title || jobRequirements.title.trim() === '') {
    return next(new AppError('Job title is required', 400));
  }
  
  if (!jobRequirements.description || jobRequirements.description.trim() === '') {
    return next(new AppError('Job description is required', 400));
  }

  if (!jobRequirements.experienceLevel || jobRequirements.experienceLevel.trim() === '') {
    return next(new AppError('Experience level is required', 400));
  }

  // Only try to split requiredSkills if it exists
  if (!jobRequirements.requiredSkills) {
    return next(new AppError('At least one required skill must be specified', 400));
  }

  const jobRequirementsArray = jobRequirements.requiredSkills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  
  if (jobRequirementsArray.length === 0) {
    return next(new AppError('At least one required skill must be specified', 400));
  }
  
  // If we get here, validation passed
  next();
};

/**
 * Validate resume path
 */
export const validateResumePath = (req: Request, res: Response, next: NextFunction) => {
  const { resumePath } = req.body;
  
  if (!resumePath || typeof resumePath !== 'string' || resumePath.trim() === '') {
    return next(new AppError('Valid resume path is required', 400));
  }
  
  // If we get here, validation passed
  next();
};

/**
 * Validate comparison request body
 */
export const validateComparisonRequest = (req: Request, res: Response, next: NextFunction) => {
  const { criteria, candidates } = req.body;
  
  if (!criteria) {
    return next(new AppError('Comparison criteria are required', 400));
  }
  
  if (!criteria.jobTitle || criteria.jobTitle.trim() === '') {
    return next(new AppError('Job title is required', 400));
  }
  
  if (!criteria.experienceLevel || criteria.experienceLevel.trim() === '') {
    return next(new AppError('Experience level is required', 400));
  }
  
  if (!candidates || !Array.isArray(candidates)) {
    return next(new AppError('Candidates array is required', 400));
  }
  
  if (candidates.length < 2) {
    return next(new AppError('At least 2 candidates are required for comparison', 400));
  }
  
  // Validate each candidate has interview assessment data
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    
    if (!candidate.id || !candidate.name) {
      return next(new AppError(`Candidate ${i + 1} must have id and name`, 400));
    }
    
    if (!candidate.interviewAssessment) {
      return next(new AppError(`Candidate ${i + 1} (${candidate.name}) must have interview assessment data. Please upload a valid Interview Assessment PDF.`, 400));
    }
    
    const assessment = candidate.interviewAssessment;
    if (!assessment.questions || !Array.isArray(assessment.questions)) {
      return next(new AppError(`Candidate ${i + 1} (${candidate.name}) must have interview questions array`, 400));
    }
    
    if (assessment.questions.length === 0) {
      return next(new AppError(`Candidate ${i + 1} (${candidate.name}) must have at least one interview question with rating. The PDF may not be a valid Interview Assessment document.`, 400));
    }

    // Check if questions have ratings
    const questionsWithRatings = assessment.questions.filter((q: any) => q.rating !== undefined && q.rating !== null);
    if (questionsWithRatings.length === 0) {
      return next(new AppError(`Candidate ${i + 1} (${candidate.name}) must have interview questions with ratings. Please ensure the PDF contains valid assessment data.`, 400));
    }
  }
  
  // If we get here, validation passed
  next();
};
