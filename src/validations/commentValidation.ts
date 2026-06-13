import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    // שינוי: החלפנו את required_error ב-message, שנתמך בגרסה שלך
    content: z.string({ message: 'תוכן התגובה אינו יכול להיות ריק' })
      .min(2, 'התגובה קצרה מדי'),
  }),
  params: z.object({
    // כאן הכל תקין
    threadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'מזהה אשכול לא תקין'),
  }),
});