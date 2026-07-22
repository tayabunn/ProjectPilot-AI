import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/logger';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  Logger.error(`REST Exception captured on ${req.method} ${req.url}: ${message}`, err);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
};
