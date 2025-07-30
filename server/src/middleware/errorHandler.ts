import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Default error status and message
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Distinguish between development and production environments
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    // Only include stack trace in development
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Not found middleware for undefined routes
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};
