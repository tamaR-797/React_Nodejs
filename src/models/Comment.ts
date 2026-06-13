import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
  {
    content: { 
      type: String, 
      required: [true, 'תוכן התגובה אינו יכול להיות ריק'] 
    },
    thread: { 
      type: Schema.Types.ObjectId, 
      ref: 'Thread', // מקשר את התגובה לאשכול הדיון הספציפי
      required: [true, 'תגובה חייבת להיות משויכת לאשכול דיון'] 
    },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', // מקשר את התגובה למשתמש שכתב אותה
      required: [true, 'תגובה חייבת להיות משויכת לכותב'] 
    }
  },
  { 
    timestamps: true 
  }
);

export const Comment = model('Comment', commentSchema);