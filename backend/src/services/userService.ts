import { User } from '../models/User';
import { Thread } from '../models/Thread';
import { Comment } from '../models/Comment';
import { AppError } from '../middlewares/errorHandler';

/**
 * קבלת כל המשתמשים
 */
export const getAllUsers = async () => {
  const users = await User.find({}).select('-password');
  return users;
};

/**
 * קבלת משתמשים פעילים (פעילות ב-5 דקות האחרונות)
 */
export const getActiveUsers = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const users = await User.find({ lastSeen: { $gte: fiveMinutesAgo } })
    .select('-password')
    .sort({ lastSeen: -1 });
  return users;
};

/**
 * קבלת משתמש לפי ID
 */
export const getUserById = async (id: string) => {
  const user = await User.findById(id).select('-password');

  if (!user) {
    throw new AppError('משתמש לא נמצא', 404);
  }

  return user;
};

/**
 * קבלת המשתמש המחובר
 */
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new AppError('משתמש לא נמצא', 404);
  }

  const threadsCount = await Thread.countDocuments({ author: userId });
  const commentsCount = await Comment.countDocuments({ author: userId });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    threadsCount,
    commentsCount,
  };
};

/**
 * עדכון תמונת פרופיל
 */
export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatarUrl },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('משתמש לא נמצא', 404);
  }

  return user;
};

/**
 * מחיקת משתמש
 */
export const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError('משתמש לא נמצא', 404);
  }

  return user;
};

/**
 * עדכון משתמש
 */
export const updateUser = async (
  id: string,
  updateData: { name?: string; email?: string; role?: string; avatarUrl?: string }
) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new AppError('משתמש לא נמצא', 404);
  }

  return user;
};
