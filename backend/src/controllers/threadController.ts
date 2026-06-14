import { Request, Response, NextFunction } from 'express';
import * as threadService from '../services/threadService';
import { Thread } from '../models/Thread'; // ייבוא המודל לצורך השליפה המאובטחת

// 1. יצירת אשכול חדש (Create)
export const createThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, category, iconType } = req.body;
    const authorId = req.user?.id; 

    // יצירת האשכול הבסיסי
    const newThread = await threadService.createThread(title, content, category, iconType, authorId);

    // 🌟 תיקון: שליפת האשכול מחדש לפי ה-ID ועשיית populate בדרך הבטוחה והנקייה ביותר ל-TypeScript
    const populatedThread = await Thread.findById(newThread._id).populate({
      path: 'author',
      select: 'name avatarUrl'
    });

    res.status(201).json({
      status: 'success',
      data: populatedThread,
    });
  } catch (error) {
    return next(error);
  }
};

// 2. הצגת כל האשכולות (Read All)
export const getAllThreads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20; 
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const { threads, totalThreads, totalPages } = await threadService.getAllThreads(page, limit, category, search);

    res.status(200).json({
      status: 'success',
      results: threads.length,
      total: totalThreads,
      currentPage: page,
      totalPages,
      data: threads,
    });
  } catch (error) {
    return next(error);
  }
};

// 3. הצגת אשכול ספציפי לפי מזהה (Read One)
export const getThreadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const thread = await threadService.getThreadById(id);
    res.status(200).json({ status: 'success', data: thread });
  } catch (error) { return next(error); }
};

// 4. עדכון אשכול (Update)
export const updateThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content } = req.body;
    const id = req.params.id as string; 
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const updatedThread = await threadService.updateThread(id, title, content, userId, userRole);
    res.status(200).json({ status: 'success', data: updatedThread });
  } catch (error) { return next(error); }
};

// 5. מחיקת אשכול (Delete)
export const deleteThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const userId = req.user?.id;
    const userRole = req.user?.role;
    await threadService.deleteThread(id, userId, userRole);
    res.status(200).json({ status: 'success', message: 'האשכול נמחק בהצלחה' });
  } catch (error) { return next(error); }
};