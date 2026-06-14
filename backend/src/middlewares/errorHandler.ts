import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// מחלקה מותאמת אישית לשגיאות API עם קוד סטטוס
export class AppError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ה-Middleware המרכזי לתפיסת שגיאות
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'שגיאת שרת פנימית';

  // שימוש בלוגר המרכזי כדי לתעד את השגיאה
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};