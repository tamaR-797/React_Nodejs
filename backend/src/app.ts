import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { globalErrorHandler, AppError } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import threadRoutes from './routes/threadRoutes';
import commentRoutes from './routes/commentRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// חיבור למסד הנתונים
connectDB();

// Middlewares בסיסיים
app.use(cors());
app.use(express.json());

// קבצים סטטיים - תמונות פרופיל
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// חיבור הראוטרים
app.use('/api/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api', commentRoutes);
app.use('/api/users', userRoutes);

// נקודת קצה זמנית לבדיקה (Health Check)
app.get('/health', (req, res) => {
    logger.info('בדיקת תקינות שרת בוצעה בהצלחה');
    res.status(200).json({ status: 'OK', message: 'השרת פועל כהלכה!' });
});

// טיפול בנתיבים שלא קיימים (404)
app.use((req, res, next) => {
    next(new AppError(`לא נמצא נתיב עבור ${req.originalUrl}`, 404));
});

// הפעלת מנגנון השגיאות המרכזי (חייב להיות בסוף!)
app.use(globalErrorHandler);

// הפעלת השרת
app.listen(config.port, () => {
    logger.info(`השרת רץ בהצלחה על פורט ${config.port}`);
});