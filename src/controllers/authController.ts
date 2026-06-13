import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService'; // ייבוא שכבת השירות

// 1. פונקציית רישום משתמש חדש (Register)
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // קריאה לשירות שיבצע את כל הלוגיקה והרישום
    const userData = await authService.registerUser(name, email, password);

    // החזרת תשובה חיובית ללקוח
    res.status(201).json({
      status: 'success',
      message: 'המשתמש נרשם בהצלחה!',
      data: userData,
    });
  } catch (error) {
    // אם ה-Service זרק שגיאה (AppError), הבלוק catch יתפוס אותה ויעביר ל-Global Error Handler
    return next(error);
  }
};

// 2. פונקציית התחברות (Login)
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // קריאה לשירות שיבצע את האימות וינפיק טוקן
    const { token, user } = await authService.loginUser(email, password);

    // החזרת תשובה עם הנתונים והטוקן
    res.status(200).json({
      status: 'success',
      message: 'התחברת בהצלחה!',
      token,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};