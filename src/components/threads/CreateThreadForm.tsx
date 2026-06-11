import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface Thread {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  repliesCount: number;
}

interface CreateThreadFormProps {
  onCreate: (payload: { title: string; content: string; category: string }) => Promise<void>;
}

/**
 * CreateThreadForm
 * Simple controlled form to create a new thread through the backend.
 * Calls `onCreate` with the payload and updates the UI on success.
 */
const CreateThreadForm: React.FC<CreateThreadFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedCategory = category.trim();

    if (!trimmedTitle || !trimmedContent || !trimmedCategory) {
      setError('Title, content, and category are all required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({ title: trimmedTitle, content: trimmedContent, category: trimmedCategory });
      setTitle('');
      setContent('');
      setSuccessMessage('Thread created successfully.');
    } catch (submitError) {
      setError('Unable to create thread. Please try again.');
      console.error('Thread creation failed', submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="thread-detail-card" style={{ marginBottom: '1.5rem' }}>
      <h2>Create New Thread</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Add a new discussion topic and it will appear at the top of the thread list.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="search-field"
              placeholder="Thread title"
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Category</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="search-field"
              placeholder="Category"
            />
          </label>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>Content</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="reply-textarea"
              placeholder="Write the thread content here..."
            />
          </label>

          {error && <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>}
          {successMessage && <p style={{ color: '#16a34a', margin: 0 }}>{successMessage}</p>}

          <motion.button type="submit" className="button" whileHover={{ scale: 1.02 }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Thread'}
          </motion.button>
        </div>
      </form>
    </section>
  );
};

export default CreateThreadForm;
