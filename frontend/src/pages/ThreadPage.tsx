import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../hooks/useAppSelector';
import { getThreadById, getThreadComments, postThreadComment, likeComment, editComment, deleteComment, ThreadDetail } from '../api/threadsApi';
import AISummaryModal from '../components/AISummaryModal';
import UserAvatar from '../components/UserAvatar';
import { formatDate } from '../utils/dateUtils';
import { motion } from 'framer-motion';

/**
 * ThreadPage
 * Shows a single thread with its comments. Uses TanStack Query to fetch data
 * and provides a form to post comments when authenticated.
 */
const ThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const userName = useAppSelector((state) => state.auth.user?.name);
  const userAvatarUrl = useAppSelector((state) => state.auth.user?.avatarUrl); // 🌟 השורה החדשה!
  const [commentText, setCommentText] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const emojis = ['👍', '❤️', '😂', '🔥', '😮', '😢'];

  if (!id) {
    return <div>Invalid thread ID.</div>;
  }

  const {
    data: thread,
    isLoading,
    isError,
    error,
  } = useQuery<ThreadDetail, Error>({
    queryKey: ['thread', id],
    queryFn: () => getThreadById(id),
    enabled: Boolean(id),
  });

  const {
    data: commentsData,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsFetchError,
  } = useQuery({
    queryKey: ['thread', id, 'comments'],
    queryFn: () => getThreadComments(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (content: string) => postThreadComment(id, { content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  // 🌟 תיקון השהיית הלייקים: שיפור ה-Optimistic Update שיתמוך גם בלייק וגם בביטול לייק מיידי
  const likeMutation = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      likeComment(commentId, emoji),
    onMutate: async ({ commentId, emoji }) => {
      await queryClient.cancelQueries({ queryKey: ['thread', id, 'comments'] });
      const previousComments = queryClient.getQueryData(['thread', id, 'comments']);

      queryClient.setQueryData(['thread', id, 'comments'], (old: any) => {
        if (!old || !old.comments) return old;
        return {
          ...old,
          comments: old.comments.map((comment: any) => {
            if (comment.id !== commentId) return comment;

            const existingLikes = comment.likes || [];
            // בדיקה האם המשתמש הנוכחי כבר הגיב באותו אמוג'י ספציפי
            const hasAlreadyLiked = existingLikes.some(
              (l: any) => l.userId === userId && l.emoji === emoji
            );

            let updatedLikes;
            if (hasAlreadyLiked) {
              // אם כבר קיים - נסיר אותו מיידית מהמסך (Unlike אופטימי)
              updatedLikes = existingLikes.filter(
                (l: any) => !(l.userId === userId && l.emoji === emoji)
              );
            } else {
              // אם לא קיים - נוסיף אותו מיידית למסך (Like אופטימי)
              updatedLikes = [...existingLikes, { userId, emoji, userName }];
            }

            return {
              ...comment,
              likes: updatedLikes,
            };
          }),
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['thread', id, 'comments'], context.previousComments);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: (commentId: string) => editComment(commentId, editCommentText),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditCommentText('');
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  if (isLoading) {
    return <div>Loading thread...</div>;
  }

  if (isError) {
    return <div>Error loading thread: {error?.message || 'Unknown error'}</div>;
  }

  if (!thread) {
    return <div>Thread not found.</div>;
  }

  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    mutation.mutate(commentText.trim());
  };

  const handleLike = (commentId: string, emoji: string) => {
    if (!isAuthenticated) {
      alert('You must be logged in to like comments');
      return;
    }
    likeMutation.mutate({ commentId, emoji });
    setShowEmojiPicker(null);
  };

  const startEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentContent);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editCommentText.trim()) return;
    editMutation.mutate(commentId);
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההודעה?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const groupLikesByEmoji = (likes: any[] = []) => {
    const grouped = new Map<string, Array<{ userId: string, name?: string }>>();
    likes.forEach((like: any) => {
      if (!grouped.has(like.emoji)) {
        grouped.set(like.emoji, []);
      }
      grouped.get(like.emoji)!.push({
        userId: like.userId,
        name: like.userName
      });
    });
    return Array.from(grouped.entries());
  };

  // 🌟 חילוץ השם של כותב האשכול
  const displayAuthorName = typeof thread.author === 'object' ? (thread.author as any).name : thread.author;

  // 🌟 המעקף החכם: אם אין תמונה מהשרת והכותב זו את, ניקח את התמונה שלך מה-Redux!
  const displayAuthorAvatar =
    (thread as any).authorAvatarUrl ||
    (thread as any).avatarUrl ||
    (typeof thread.author === 'object' ? (thread.author as any).avatarUrl : undefined) ||
    (displayAuthorName === userName ? userAvatarUrl : undefined);

  console.log("=== THREAD DATA FROM SERVER ===", thread);

  return (
    <main className="page-shell">
      <motion.button className="back-button" type="button" onClick={() => navigate(-1)} whileHover={{ scale: 1.02 }}>
        Back
      </motion.button>

      {/* כרטיסיית כותרת האשכול הלבנה */}
      <article className="thread-detail-card">
        <h1>{thread.title}</h1>
        <p>{thread.content}</p>

        {/* 🌟 שינוי מבנה המטא: הוספת תמונת הפרופיל בצורה נקייה וללא שום ריחוף/Hover */}
        <div className="thread-meta-block" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
          <UserAvatar
            name={displayAuthorName || 'User'}
            avatarUrl={displayAuthorAvatar}
            size={36}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.3' }}>
            <span style={{ fontWeight: 600, color: '#1f2937' }}>By {displayAuthorName}</span>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(thread.createdAt)}</span>
          </div>
        </div>
      </article>

      <div className="form-actions">
        <motion.button className="ai-button" type="button" onClick={() => setShowSummaryModal(true)} whileHover={{ scale: 1.02 }}>
          Summarize with AI
        </motion.button>
      </div>

      <section>
        <div className="section-heading">
          <h2>Comments</h2>
        </div>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : commentsError ? (
          <p>Failed to load comments: {commentsFetchError?.message || 'Unknown error'}</p>
        ) : !commentsData || commentsData.comments.length === 0 ? (
          <p>No comments yet. Be the first to join the conversation.</p>
        ) : (
          <ul className="reply-list">
            {commentsData.comments.map((comment) => (
              <li key={comment.id} className="reply-card">
                <div className="reply-author-row">
                  {/* אווטאר של תגובות - נשאר נקי ובלי ריחוף כפי שביקשת */}
                  <UserAvatar name={comment.author} avatarUrl={comment.authorAvatarUrl} size={36} />
                  <div>
                    <strong className="reply-author-name">{comment.author}</strong>
                    <small className="reply-date">{formatDate(comment.createdAt)}</small>
                  </div>
                  {userId ? (
                    <div className="comment-header-actions">
                      {userId === comment.authorId ? (
                        <>
                          <button
                            className="comment-action-btn"
                            onClick={() => startEditComment(comment.id, comment.content)}
                            title="ערוך"
                          >
                            edit
                          </button>
                          <button
                            className="comment-action-btn delete-btn"
                            onClick={() => handleDeleteComment(comment.id)}
                            title="מחק"
                          >
                            delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="edit-comment-form">
                    <textarea
                      className="reply-textarea"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      placeholder="ערוך את ההודעה..."
                    />
                    <div className="form-actions">
                      <button
                        className="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={editMutation.isPending}
                      >
                        {editMutation.isPending ? 'שמירה...' : 'שמור'}
                      </button>
                      <button
                        className="navbar-button"
                        onClick={() => setEditingCommentId(null)}
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{comment.content}</p>
                    <div className="reply-actions">
                      {/* תצוגת לייקים מהירה בגוגל צ'אט */}
                      <div className="comment-likes-container">
                        {comment.likes && comment.likes.length > 0 && (
                          <div className="likes-grouped">
                            {groupLikesByEmoji(comment.likes).map(([emoji, likers]) => (
                              <motion.button
                                key={emoji}
                                className="like-button-grouped"
                                onClick={() => {
                                  if (!isAuthenticated) {
                                    alert('You must be logged in to like comments');
                                    return;
                                  }
                                  handleLike(comment.id, emoji);
                                }}
                                title={`${likers.map(l => l.name || 'User').join(', ')}`}
                                whileHover={{ scale: 1.05 }}
                              >
                                <span className="like-emoji-icon">{emoji}</span>
                                <span className="like-count">{likers.length}</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* כפתור הוספת לייק */}
                      <div className="emoji-picker-wrapper">
                        <motion.button
                          className="emoji-button"
                          onClick={() =>
                            setShowEmojiPicker(
                              showEmojiPicker === comment.id ? null : comment.id
                            )
                          }
                          whileHover={{ scale: 1.1 }}
                        >
                          😊
                        </motion.button>
                        {showEmojiPicker === comment.id && (
                          <motion.div
                            className="emoji-picker"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {emojis.map((emoji) => (
                              <motion.button
                                key={emoji}
                                className="emoji-option"
                                onClick={() => handleLike(comment.id, emoji)}
                                whileHover={{ scale: 1.2 }}
                                disabled={likeMutation.isPending}
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
            ))}
          </ul>
        )}
      </section>

      {isAuthenticated ? (
        <section className="reply-form-card">
          <div className="section-heading">
            <h2>Post a reply</h2>
          </div>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className="reply-textarea"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write your reply..."
            />
            <div className="form-actions">
              <button className="button" type="submit" disabled={mutation.isPending || !commentText.trim()}>
                {mutation.isPending ? 'Posting...' : 'Post reply'}
              </button>
              <span className="form-note">Your reply will appear after submission.</span>
            </div>
          </form>
          {mutation.isError && (
            <p className="error-text">
              Failed to post comment: {mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}
            </p>
          )}
        </section>
      ) : (
        <p style={{ marginTop: '1.5rem', color: '#4b5563' }}>You must be logged in to post a comment.</p>
      )}

      {showSummaryModal && id && (
        <AISummaryModal threadId={id} onClose={() => setShowSummaryModal(false)} />
      )}
    </main>
  );
};

export default ThreadPage;