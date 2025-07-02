import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '@budget-tracker/shared-types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn('Authentication failed:', error?.message);
      return res.status(401).json({
        success: false,
        error: {
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        message: 'Authentication service error',
      },
    });
  }
};