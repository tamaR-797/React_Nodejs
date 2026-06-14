import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ message: 'חובה להזין שם משתמש' })
      .min(2, 'שם המשתמש חייב להכיל לפחות 2 תווים')
      .max(30, 'שם המשתמש אינו יכול לעלות על 30 תווים'),
    
    email: z.string({ message: 'חובה להזין כתובת אימייל' })
      .email('כתובת האימייל אינה תקינה'),
    
    password: z.string({ message: 'חובה להזין סיסמה' })
      .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'חובה להזין אימייל' })
      .email('כתובת האימייל אינה תקינה'),
    password: z.string({ message: 'חובה להזין סיסמה' }),
  }),
});