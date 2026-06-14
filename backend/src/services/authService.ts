import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { config } from '../config/env';

// 1. לוגיקת רישום משתמש (Register Service)
export const registerUser = async (name: string, email: string, password: string) => {
  // א. בדיקה האם המשתמש כבר קיים במערכת (לפי אימייל)
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('כתובת האימייל הזו כבר רשומה במערכת', 400);
  }

  // ב. הצפנת הסיסמה (Salting & Hashing)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const isAdmin = config.adminEmail && email.toLowerCase() === config.adminEmail.toLowerCase();

  // ג. יצירת המשתמש החדש ושמירתו ב-DB
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: isAdmin ? 'Admin' : 'User',
  });

  // ד. החזרת הנתונים המעובדים (ללא הסיסמה)
  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
    role: newUser.role,
  };
};

// 2. לוגיקת התחברות (Login Service)
export const loginUser = async (email: string, password: string) => {
  // א. חיפוש המשתמש לפי אימייל
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('אימייל או סיסמה אינם תקינים', 401);
  }

  // ב. בדיקה האם הסיסמה שהוזנה מתאימה לסיסמה המוצפנת ב-DB
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError('אימייל או סיסמה אינם תקינים', 401);
  }

  // ג. יצירת טוקן מאובטח (JWT)
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  // ד. החזרת הטוקן יחד עם פרטי המשתמש
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  };
};