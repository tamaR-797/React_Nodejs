import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      // אנחנו מוסיפים שדה אופציונלי בשם user שיכיל את ה-ID והתפקיד של המשתמש מהטוקן
      user?: {
        id: string;
        role: string;
      };
    }
  }
}