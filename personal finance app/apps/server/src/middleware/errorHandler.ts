import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '@budget-tracker/shared-types';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      error: err.code || 'UNKNOWN_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};