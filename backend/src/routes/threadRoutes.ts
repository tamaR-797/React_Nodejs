import { Router } from 'express';
import { createThread, getAllThreads, getThreadById, updateThread, deleteThread } from '../controllers/threadController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { createThreadSchema } from '../validations/threadValidation';

const router = Router();

// נתיבים ציבוריים - כולם יכולים לראות את האשכולות ואת התוכן שלהם
router.get('/', getAllThreads);
router.get('/:id', getThreadById);

// נתיבים מוגנים - דורשים טוקן של משתמש מחובר (Bearer Token)
router.post('/', protect, validate(createThreadSchema), createThread);
router.patch('/:id', protect, updateThread);
router.delete('/:id', protect, deleteThread);

export default router;