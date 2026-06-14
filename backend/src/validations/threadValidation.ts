import { z } from 'zod';

export const createThreadSchema = z.object({
  body: z.object({
    title: z.string({ message: 'חובה להזין כותרת לאשכול' })
      .min(5, 'הכותרת חייבת להכיל לפחות 5 תווים')
      .max(100, 'הכותרת ארוכה מדי (מקסימום 100 תווים)'),
    
    content: z.string({ message: 'תוכן האשכול אינו יכול להיות ריק' })
      .min(10, 'תוכן האשכול חייב להכיל לפחות 10 תווים'),
    
    category: z.string({ message: 'חובה לבחור קטגוריית פורום' }),
  }),
});