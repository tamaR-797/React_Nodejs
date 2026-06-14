import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { AppError } from '../middlewares/errorHandler';

/**
 * קבלת המשתמש המחובר
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userService.getCurrentUser(req.user!.id);

        res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * עדכון תמונת פרופיל
 */
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            return next(new AppError('לא נבחר קובץ', 400));
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await userService.updateAvatar(req.user!.id, avatarUrl);

        res.status(200).json({
            status: 'success',
            message: 'התמונה עודכנה בהצלחה',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * קבלת כל המשתמשים (רק לאדמינים)
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * קבלת משתמשים פעילים (רק לאדמינים)
 */
export const getActiveUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.getActiveUsers();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * קבלת משתמש לפי ID (רק לאדמינים)
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(String(id));

        res.status(200).json({
            status: 'success',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * מחיקת משתמש (רק לאדמינים)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userService.deleteUser(String(id));

        res.status(200).json({
            status: 'success',
            message: 'המשתמש נמחק בהצלחה',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * עדכון משתמש (רק לאדמינים)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = String(req.params.id);
        const { name, email, role, avatarUrl } = req.body;
        const user = await userService.updateUser(id, {
            name,
            email,
            role,
            avatarUrl,
        });

        res.status(200).json({
            status: 'success',
            message: 'המשתמש עודכן בהצלחה',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};
