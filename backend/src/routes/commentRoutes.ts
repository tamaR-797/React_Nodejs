import { Router } from 'express';
import { 
  createComment, 
  getCommentsByThread, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { createCommentSchema } from '../validations/commentValidation';

const router = Router();

// נתיבים המשוייכים לאשכול ספציפי
// צפייה בתגובות היא ציבורית, כתיבת תגובה דורשת התחברות ואימות Zod
router.get('/threads/:threadId/comments', getCommentsByThread);
router.post('/threads/:threadId/comments', protect, validate(createCommentSchema), createComment);

// נתיבים לפעולות ישירות על תגובה ספציפית לפי ה-ID שלה
router.patch('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);

export default router;