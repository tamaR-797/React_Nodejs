import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { config } from '../config/env';
import { User } from '../models/User';

interface JwtPayload {
  id: string;
  role: string;
}

// 1. הגנה על נתיבים - בדיקה שהמשתמש מחובר עם טוקן תקין
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // א. בדיקה האם הטוקן נשלח בהדר של ה-Authorization (בפורמט Bearer TOKEN)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('אינך מחובר, אנא התחבר כדי לקבל גישה', 401));
    }

    // ב. אימות הטוקן ופענוח הנתונים שבו
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // ג. שמירת נתוני המשתמש על ה-req כדי שהקונטרולרים הבאים יוכלו להשתמש בהם
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // עדכון זמן פעילות אחרון (לא מחכים לסיום)
    User.findByIdAndUpdate(decoded.id, { lastSeen: new Date() }).catch(() => {});

    return next(); // הטוקן תקין! ממשיכים הלאה
  } catch (error) {
    return next(new AppError('טוקן לא תקין או פג תוקף, אנא התחבר שנית', 401));
  }
};

// 2. הגבלת גישה לפי תפקידים (Authorization)
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // בדיקה האם המשתמש קיים והאם התפקיד שלו נמצא ברשימת התפקידים המורשים
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('אין לך הרשאה לבצע פעולה זו', 403)); // 403 = Forbidden
    }
    
    return next(); // יש הרשאה! ממשיכים
  };
};