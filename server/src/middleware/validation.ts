import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { JobRequirements } from '../types/interview';

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
  
  if (!jobRequirements.requiredSkills || !Array.isArray(jobRequirements.requiredSkills) || jobRequirements.requiredSkills.length === 0) {
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
