import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService'; // ייבוא שכבת השירות של התגובות

// 1. כתיבת תגובה חדשה באשכול (Create)
export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    
    // תיקון TypeScript: המרה מפורשת למחרוזת בודדת (string)
    const threadId = req.params.threadId as string;
    const authorId = req.user?.id;

    // קריאה לשירות ליצירת התגובה
    const newComment = await commentService.createComment(content, threadId, authorId);

    res.status(201).json({
      status: 'success',
      data: newComment,
    });
  } catch (error) {
    return next(error);
  }
};

// 2. שליפת כל התגובות של אשכול ספציפי (Read)
export const getCommentsByThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // תיקון TypeScript: המרה מפורשת למחרוזת בודדת (string)
    const threadId = req.params.threadId as string;

    // קריאה לשירות לקבלת כל התגובות של האשכול
    const comments = await commentService.getCommentsByThread(threadId);

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: comments,
    });
  } catch (error) {
    return next(error);
  }
};

// 3. עדכון תגובה (Update)
export const updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    
    // תיקון TypeScript: המרה מפורשת למחרוזת בודדת (string) בשביל ה-ID של התגובה
    const commentId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // קריאה לשירות לעדכון התגובה
    const updatedComment = await commentService.updateComment(commentId, content, userId, userRole);

    res.status(200).json({
      status: 'success',
      data: updatedComment,
    });
  } catch (error) {
    return next(error);
  }
};

// 4. מחיקת תגובה (Delete)
export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // תיקון TypeScript: המרה מפורשת למחרוזת בודדת (string) בשביל ה-ID של התגובה
    const commentId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // קריאה לשירות למחיקת התגובה
    await commentService.deleteComment(commentId, userId, userRole);

    res.status(200).json({
      status: 'success',
      message: 'התגובה נמחקה בהצלחה',
    });
  } catch (error) {
    return next(error);
  }
};