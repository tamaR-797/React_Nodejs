import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';
import { formatDate } from '../utils/dateUtils';

interface CommentCardProps {
  comment: any;
  userId?: string;
  isAuthenticated: boolean;
  onLike: (commentId: string, emoji: string) => void;
  onEdit: (commentId: string, text: string) => Promise<void> | void;
  onDelete: (commentId: string) => void;
  isEditPending: boolean;
  isLikePending: boolean;
}

const EMOJIS = ['👍', '❤️', '😂', '🔥', '😮', '😢'];

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  userId,
  isAuthenticated,
  onLike,
  onEdit,
  onDelete,
  isEditPending,
  isLikePending,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    await onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const groupLikesByEmoji = (likes: any[] = []) => {
    const grouped = new Map<string, Array<{ userId: string; name?: string }>>();
    likes.forEach((like: any) => {
      if (!grouped.has(like.emoji)) grouped.set(like.emoji, []);
      grouped.get(like.emoji)!.push({ userId: like.userId, name: like.userName });
    });
    return Array.from(grouped.entries());
  };

  return (
    <li className="reply-card">
      <div className="reply-author-row">
        <UserAvatar name={comment.author} avatarUrl={comment.authorAvatarUrl} size={36} />
        <div>
          <strong className="reply-author-name">{comment.author}</strong>
          <small className="reply-date">{formatDate(comment.createdAt)}</small>
        </div>
        
        {userId === comment.authorId && !isEditing && (
          <div className="comment-header-actions">
            <button className="comment-action-btn edit-btn" onClick={() => setIsEditing(true)} title="ערוך">edit</button>
            <button className="comment-action-btn delete-btn" onClick={() => onDelete(comment.id)} title="מחק">delete</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-comment-form">
          <textarea className="reply-textarea" value={editText} onChange={(e) => setEditText(e.target.value)} />
          <div className="form-actions">
            <button className="button" onClick={handleSave} disabled={isEditPending}>
              {isEditPending ? 'שמירה...' : 'שמור'}
            </button>
            <button className="navbar-button" onClick={() => setIsEditing(false)}>ביטול</button>
          </div>
        </div>
      ) : (
        <>
          <p>{comment.content}</p>
          <div className="reply-actions">
            <div className="comment-likes-container">
              {comment.likes && comment.likes.length > 0 && (
                <div className="likes-grouped">
                  {groupLikesByEmoji(comment.likes).map(([emoji, likers]) => (
                    <motion.button
                      key={emoji}
                      className="like-button-grouped"
                      onClick={() => isAuthenticated ? onLike(comment.id, emoji) : alert('You must be logged in')}
                      title={likers.map((l) => l.name || 'User').join(', ')}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="like-emoji-icon">{emoji}</span>
                      <span className="like-count">{likers.length}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="emoji-picker-wrapper">
              <motion.button className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} whileHover={{ scale: 1.1 }}>
                😊
              </motion.button>
              {showEmojiPicker && (
                <motion.div className="emoji-picker" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  {EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      className="emoji-option"
                      onClick={() => {
                        onLike(comment.id, emoji);
                        setShowEmojiPicker(false);
                      }}
                      whileHover={{ scale: 1.2 }}
                      disabled={isLikePending}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </li>
  );
};

export default CommentCard;