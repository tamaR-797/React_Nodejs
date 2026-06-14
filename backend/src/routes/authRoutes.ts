import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middlewares/validateMiddleware';

import { registerSchema, loginSchema } from '../validations/userValidation';

const router = Router();

// נתיב רישום: קודם מפעילים ולידציה של Zod, ואז עוברים ללוגיקת הרישום
router.post('/register', validate(registerSchema), register);

// נתיב התחברות: קודם ולידציה, ואז לוגיקת התחברות
router.post('/login', validate(loginSchema), login);

export default router;