import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { useAppSelector } from '../hooks/useAppSelector';
import { getThreadById, getThreadComments, postThreadComment, likeComment, editComment, deleteComment, ThreadDetail } from '../api/threadsApi';

import ThreadHeader from '../components/ThreadHeader';
import CommentCard from '../components/CommentCard';
import CommentForm from '../components/CommentForm';
import AISummaryModal from '../components/AISummaryModal';

const ThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const userName = useAppSelector((state) => state.auth.user?.name);
  const userAvatarUrl = useAppSelector((state) => state.auth.user?.avatarUrl);

  const [showSummaryModal, setShowSummaryModal] = useState(false);

  if (!id) return <div>Invalid thread ID.</div>;

  // --- Queries ---
  const { data: thread, isLoading, isError, error } = useQuery<ThreadDetail, Error>({
    queryKey: ['thread', id],
    queryFn: () => getThreadById(id),
    enabled: Boolean(id),
  });

  const { data: commentsData, isLoading: commentsLoading, isError: commentsError, error: commentsFetchError } = useQuery({
    queryKey: ['thread', id, 'comments'],
    queryFn: () => getThreadComments(id),
    enabled: Boolean(id),
  });

  // --- Mutations ---
  const postCommentMutation = useMutation({
    mutationFn: (content: string) => postThreadComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => likeComment(commentId, emoji),
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
            const hasAlreadyLiked = existingLikes.some((l: any) => l.userId === userId && l.emoji === emoji);

            const updatedLikes = hasAlreadyLiked
              ? existingLikes.filter((l: any) => !(l.userId === userId && l.emoji === emoji))
              : [...existingLikes, { userId, emoji, userName }];

            return { ...comment, likes: updatedLikes };
          }),
        };
      });
      return { previousComments };
    },
    onError: (err, vars, context) => {
      if (context?.previousComments) queryClient.setQueryData(['thread', id, 'comments'], context.previousComments);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] }),
  });

  const editMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) => editComment(commentId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });

  // --- Handlers ---
  const handleLike = (commentId: string, emoji: string) => {
    if (!isAuthenticated) return alert('You must be logged in to like comments');
    likeMutation.mutate({ commentId, emoji });
  };

  const handleEditComment = async (commentId: string, text: string) => {
    await editMutation.mutateAsync({ commentId, text });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההודעה?')) {
      deleteMutation.mutate(commentId);
    }
  };

  if (isLoading) return <div>Loading thread...</div>;
  if (isError || !thread) return <div>Error loading thread: {error?.message || 'Thread not found.'}</div>;

  return (
    <main className="page-shell">
      <motion.button className="back-button" type="button" onClick={() => navigate(-1)} whileHover={{ scale: 1.02 }}>
        Back
      </motion.button>

      <ThreadHeader
        thread={thread}
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        onSummarizeClick={() => setShowSummaryModal(true)}
      />

      <section>
        <div className="section-heading"><h2>Comments</h2></div>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : commentsError ? (
          <p>Failed to load comments: {commentsFetchError?.message || 'Unknown error'}</p>
        ) : !commentsData || commentsData.comments.length === 0 ? (
          <p>No comments yet. Be the first to join the conversation.</p>
        ) : (
          <ul className="reply-list">
            {commentsData.comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onLike={handleLike}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                isEditPending={editMutation.isPending}
                isLikePending={likeMutation.isPending}
              />
            ))}
          </ul>
        )}
      </section>

      {isAuthenticated ? (
        <CommentForm
          onSubmit={(content) => postCommentMutation.mutateAsync(content)}
          isPending={postCommentMutation.isPending}
          isError={postCommentMutation.isError}
          error={postCommentMutation.error}
        />
      ) : (
        <p style={{ marginTop: '1.5rem', color: '#4b5563' }}>You must be logged in to post a comment.</p>
      )}

      {showSummaryModal && <AISummaryModal threadId={id} onClose={() => setShowSummaryModal(false)} />}
    </main>
  );
};

export default ThreadPage;