import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // מדפיס לטרמינל
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // שומר שגיאות לקובץ
    new winston.transports.File({ filename: 'logs/combined.log' }) // שומר הכל לקובץ
  ],
});