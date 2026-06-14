import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('מחובר למסד הנתונים MongoDB בהצלחה!');
  } catch (error) {
    logger.error(`שגיאה בחיבור למסד הנתונים: ${error}`);
    process.exit(1); // סגירת השרת במקרה של כישלון קריטי בחיבור
  }
};