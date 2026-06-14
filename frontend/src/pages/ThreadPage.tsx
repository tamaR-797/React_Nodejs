import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../hooks/useAppSelector';
import { getThreadById, getThreadComments, postThreadComment, ThreadDetail } from '../api/threadsApi';
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
  const [commentText, setCommentText] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);

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

    if (!commentText.trim()) {
      return;
    }

    mutation.mutate(commentText.trim());
  };

  return (
    <main className="page-shell">
      <motion.button className="back-button" type="button" onClick={() => navigate(-1)} whileHover={{ scale: 1.02 }}>
        Back
      </motion.button>

      <article className="thread-detail-card">
        <h1>{thread.title}</h1>
        <p>{thread.content}</p>
        <div className="thread-meta-block">
          <span>By {thread.author}</span>
          <span>{formatDate(thread.createdAt)}</span>
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
                <UserAvatar name={comment.author} avatarUrl={comment.authorAvatarUrl} size={36} />
                <div>
                  <strong className="reply-author-name">{comment.author}</strong>
                  <small className="reply-date">{formatDate(comment.createdAt)}</small>
                </div>
              </div>
              <p>{comment.content}</p>
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
