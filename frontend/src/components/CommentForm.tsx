import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<unknown> | void; 
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}
const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isPending, isError, error }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    await onSubmit(commentText.trim());
    setCommentText('');
  };

  return (
    <section className="reply-form-card">
      <div className="section-heading">
        <h2>Post a reply</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          className="reply-textarea"
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Write your reply..."
        />
        <div className="form-actions">
          <button className="button" type="submit" disabled={isPending || !commentText.trim()}>
            {isPending ? 'Posting...' : 'Post reply'}
          </button>
          <span className="form-note">Your reply will appear after submission.</span>
        </div>
      </form>
      {isError && (
        <p className="error-text">
          Failed to post comment: {error?.message || 'Unknown error'}
        </p>
      )}
    </section>
  );
};

export default CommentForm;