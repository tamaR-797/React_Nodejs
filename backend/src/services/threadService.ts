import { Thread } from '../models/Thread';
import { Comment } from '../models/Comment';
import { AppError } from '../middlewares/errorHandler';

// 1. לוגיקת יצירת אשכול (Create Thread Service)
export const createThread = async (title: string, content: string, category: string, authorId: string | undefined) => {
  const newThread = await Thread.create({
    title,
    content,
    category,
    author: authorId,
  });
  return newThread;
};

// 2. לוגיקת הצגת כל האשכולות כולל חיפוש, סינון ו-Pagination (Read All Service)
export const getAllThreads = async (page: number, limit: number, category?: string, search?: string) => {
  const skip = (page - 1) * limit;
  const queryObj: any = {};

  // סינון לפי קטגוריה
  if (category) {
    queryObj.category = category;
  }

  // חיפוש טקסט חופשי בכותרת
  if (search) {
    queryObj.title = { $regex: search, $options: 'i' };
  }

  // שליפת הנתונים עם הפעלת המגבלות וה-populate
  const threads = await Thread.find(queryObj)
    .populate('author', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // עדכון repliesCount מהמספר האמיתי של תגובות
  const threadIds = threads.map((t) => t._id);
  if (threadIds.length > 0) {
    const counts = await Comment.aggregate([
      { $match: { thread: { $in: threadIds } } },
      { $group: { _id: '$thread', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    for (const thread of threads) {
      const realCount = countMap.get(String(thread._id)) ?? 0;
      thread.repliesCount = realCount;
    }
  }

  // ספירת סך כל האשכולות שקיימים תחת השאילתא הזו
  const totalThreads = await Thread.countDocuments(queryObj);

  return {
    threads,
    totalThreads,
    totalPages: Math.ceil(totalThreads / limit),
  };
};

// 3. לוגיקת הצגת אשכול ספציפי לפי מזהה (Read One Service)
export const getThreadById = async (id: string) => {
  const thread = await Thread.findById(id).populate('author', 'name email');

  if (!thread) {
    throw new AppError('לא נמצא אשכול דיון עם מזהה זה', 404);
  }

  return thread;
};

// 4. לוגיקת עדכון אשכול (Update Thread Service)
export const updateThread = async (
  id: string,
  title: string | undefined,
  content: string | undefined,
  userId: string | undefined,
  userRole: string | undefined
) => {
  const thread = await Thread.findById(id);

  if (!thread) {
    throw new AppError('לא נמצא אשכול דיון עם מזהה זה', 404);
  }

  // אבטחה: בדיקה שהמשתמש שמנסה לערוך הוא אכן המשתמש שכתב את האשכול (או Admin)
  if (thread.author.toString() !== userId && userRole !== 'Admin') {
    throw new AppError('אין לך הרשאה לערוך אשכול זה', 403);
  }

  // עדכון השדות בפועל
  if (title) thread.title = title;
  if (content) thread.content = content;

  const updatedThread = await thread.save();
  return updatedThread;
};

// 5. לוגיקת מחיקת אשכול (Delete Thread Service)
export const deleteThread = async (id: string, userId: string | undefined, userRole: string | undefined) => {
  const thread = await Thread.findById(id);

  if (!thread) {
    throw new AppError('לא נמצא אשכול דיון עם מזהה זה', 404);
  }

  // אבטחה: בדיקה שהמוחק הוא כותב האשכול או מנהל מערכת (Admin)
  if (thread.author.toString() !== userId && userRole !== 'Admin') {
    throw new AppError('אין לך הרשאה למחוק אשכול זה', 403);
  }

  await thread.deleteOne();
};