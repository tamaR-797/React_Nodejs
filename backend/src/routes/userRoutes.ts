import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { avatarUpload } from '../config/upload';
import {
  getMe,
  uploadAvatar,
  getAllUsers,
  getActiveUsers,
  getUserById,
  deleteUser,
  updateUser,
} from '../controllers/userController';

const router = Router();

// נתיבים לכל משתמש מחובר
router.get('/me', protect, getMe);
router.post('/me/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

// נתיבים לאדמינים בלבד
router.use(protect, restrictTo('Admin'));

router.get('/active', getActiveUsers);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
