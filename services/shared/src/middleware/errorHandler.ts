import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ResponseFormatter } from '../utils/response';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle operational errors (known errors)
  if (err instanceof AppError) {
    return ResponseFormatter.error(
      res,
      err.message,
      err.statusCode,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return ResponseFormatter.badRequest(res, 'Validation error', err);
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return ResponseFormatter.badRequest(res, 'Invalid ID format');
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return ResponseFormatter.conflict(res, `${field} already exists`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseFormatter.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseFormatter.unauthorized(res, 'Token expired');
  }

  // Handle unknown errors (programming errors)
  logger.error('Unhandled error:', err);
  return ResponseFormatter.serverError(
    res,
    'Something went wrong',
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  ResponseFormatter.notFound(res, `Route ${req.originalUrl} not found`);
};
