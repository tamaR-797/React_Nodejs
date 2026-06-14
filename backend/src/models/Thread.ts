import { Schema, model } from 'mongoose';

const threadSchema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, 'חובה להזין כותרת לאשכול'], 
      trim: true 
    },
    content: { 
      type: String, 
      required: [true, 'חובה להזין את תוכן האשכול'] 
    },
    category: { 
      type: String, 
      required: [true, 'חובה לבחור קטגוריה (פורום)'],
      trim: true
    },
    // שדה חדש לבחירת סוג אייקון/תגית לאשכול
    iconType: {
      type: String,
      enum: ['discussion', 'question', 'guide', 'announcement'],
      default: 'discussion'
    },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', // יוצר קשר ישיר (Reference) למודל המשתמשים
      required: [true, 'חובה לשייך כותב לאשכול'] 
    },
    repliesCount: {
      type: Number,
      default: 0 // מספר התגובות לאשכול
    }
  },
  { 
    timestamps: true 
  }
);

export const Thread = model('Thread', threadSchema);