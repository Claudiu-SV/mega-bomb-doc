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
