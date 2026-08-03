// src/middleware/errorHandler.ts
import { Context } from 'hono';

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, c: Context) => {


  if (err instanceof AppError) {
    const errMsg = {
      success: false,
      status: err.status,
      message: (c.t(err.message)),
      err
    }
    
    return c.json(errMsg, err.statusCode);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return c.json({
      success: false,
      message: (c.t('error.validation')),
      errors: Object.values((err as any).errors).map((e: any) => e.message)
    }, 400);
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    return c.json({
      success: false,
      message: (c.t('error.duplicate'))
    }, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return c.json({
      success: false,
      message: (c.t('error.forbidden'))
    }, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return c.json({
      success: false,
      message: (c.t('error.unauthorized'))
    }, 401);
  }

  console.error('Error:', err);
  
  return c.json({
    success: false,
    message: (c.t('error.server'))
  }, 500);
};