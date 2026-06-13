import { Comment } from '../models/Comment';
import { Thread } from '../models/Thread';
import { AppError } from '../middlewares/errorHandler';

// 1. לוגיקת כתיבת תגובה (Create Comment Service)
export const createComment = async (content: string, threadId: string, authorId: string | undefined) => {
  const validThreadId = String(threadId);

  // א. בדיקה שהאשכול בכלל קיים לפני שמגיבים לו
  const thread = await Thread.findById(validThreadId);
  if (!thread) {
    throw new AppError('לא ניתן להגיב, האשכול לא נמצא', 404);
  }

  // ב. יצירת התגובה
  const newComment = await Comment.create({
    content,
    thread: validThreadId,
    author: authorId,
  });

  return newComment;
};

// 2. לוגיקת שליפת תגובות של אשכול (Get Comments Service)
export const getCommentsByThread = async (threadId: string) => {
  const comments = await Comment.find({ thread: String(threadId) })
    .populate('author', 'name email')
    .sort({ createdAt: 1 });

  return comments;
};

// 3. לוגיקת עדכון תגובה (Update Comment Service)
export const updateComment = async (
  commentId: string, 
  content: string, 
  userId: string | undefined, 
  userRole: string | undefined
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError('התגובה לא נמצאה', 404);
  }

  // אבטחה: רק כותב התגובה או Admin יכולים לערוך אותה
  if (comment.author.toString() !== userId && userRole !== 'Admin') {
    throw new AppError('אין לך הרשאה לערוך תגובה זו', 403);
  }

  comment.content = content;
  const updatedComment = await comment.save();

  return updatedComment;
};

// 4. לוגיקת מחיקת תגובה (Delete Comment Service)
export const deleteComment = async (
  commentId: string, 
  userId: string | undefined, 
  userRole: string | undefined
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError('התגובה לא נמצאה', 404);
  }

  // אבטחה: רק כותב התגובה או Admin יכולים למחוק אותה
  if (comment.author.toString() !== userId && userRole !== 'Admin') {
    throw new AppError('אין לך הרשאה למחוק תגובה זו', 403);
  }

  await comment.deleteOne();
};