import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'חובה להזין שם משתמש'],
      trim: true 
    },
    email: { 
      type: String, 
      required: [true, 'חובה להזין כתובת אימייל'], 
      unique: true, // מונע הרשמה של אותו אימייל פעמיים
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: [true, 'חובה להזין סיסמה'] 
    },
    role: { 
      type: String, 
      enum: ['User', 'Admin'], // הגבלת התפקידים רק למה שהגדרנו
      default: 'User' // ברירת מחדל - משתמש רגיל
    }
  },
  { 
    timestamps: true // יוצר אוטומטית שדות של createdAt ו-updatedAt לכל משתמש
  }
);

export const User = model('User', userSchema);