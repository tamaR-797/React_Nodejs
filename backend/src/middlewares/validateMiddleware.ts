import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from './errorHandler';

// שינוי: משתמשים ב-z.ZodSchema כטיפוס הגנרי של הסכמה
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // בודק את המידע מול הסכמה של Zod
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next(); // המידע תקין! ממשיכים ל-Controller
    } catch (error) {
      if (error instanceof ZodError) {
        // שינוי: בגרסאות החדשות משתמשים ב-error.issues ולא ב-error.errors
        const errorMessages = error.issues.map((issue) => issue.message).join(', ');
        return next(new AppError(`שגיאת קלט: ${errorMessages}`, 400));
      }
      return next(error);
    }
  };
};