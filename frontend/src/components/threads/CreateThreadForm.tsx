import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CreateThreadFormProps {
  onCreate: (payload: { title: string; content: string; category: string; iconType: string }) => Promise<void>;
}

const CreateThreadForm: React.FC<CreateThreadFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [iconType, setIconType] = useState('discussion'); // הסטייט החדש לאייקון
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
      await onCreate({ title: trimmedTitle, content: trimmedContent, category: trimmedCategory, iconType });
      setTitle('');
      setContent('');
      setIconType('discussion');
      setSuccessMessage('Thread created successfully.');
    } catch (submitError) {
      setError('Unable to create thread. Please try again.');
      console.error('Thread creation failed', submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="thread-detail-card" style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
      <h2>יצירת אשכול חדש</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        פתחי נושא חדש לדיון והוא יופיע מיד בראש הרשימה.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>כותרת האשכול</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="search-field"
              placeholder="כתבי כותרת ברורה..."
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>קטגוריה</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="search-field"
                placeholder="קטגוריה"
              />
            </label>

            {/* רכיב בחירת אייקון מודרני */}
            <label style={{ display: 'grid', gap: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>סוג נושא (אייקון)</span>
              <select
                value={iconType}
                onChange={(event) => setIconType(event.target.value)}
                className="search-field"
                style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
              >
                <option value="discussion">💬 דיון כללי</option>
                <option value="question">❓ שאלה / עזרה</option>
                <option value="guide">💡 מדריך / טיפ</option>
                <option value="announcement">📢 מודעה חשובה</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'grid', gap: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>תוכן האשכול</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="reply-textarea"
              placeholder="כתבי כאן את התוכן המלא של האשכול..."
              style={{ minHeight: '120px' }}
            />
          </label>

          {error && <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>}
          {successMessage && <p style={{ color: '#16a34a', margin: 0 }}>{successMessage}</p>}

          <motion.button type="submit" className="button" whileHover={{ scale: 1.01 }} disabled={isSubmitting}>
            {isSubmitting ? 'מייצר אשכול...' : 'פרסם אשכול חדש'}
          </motion.button>
        </div>
      </form>
    </section>
  );
};

export default CreateThreadForm;