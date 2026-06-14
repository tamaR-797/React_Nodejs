import { Schema, model, Types } from 'mongoose';

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
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', // יוצר קשר ישיר (Reference) למודל המשתמשים
      required: [true, 'חובה לשייך כותב לאשכול'] 
    }
  },
  { 
    timestamps: true 
  }
);

export const Thread = model('Thread', threadSchema);