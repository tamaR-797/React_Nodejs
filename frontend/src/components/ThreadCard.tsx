import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/dateUtils';
import { Thread } from '../pages/HomePage';
interface ThreadCardProps {
  thread: Thread;
}

const getIconEmoji = (type?: string) => {
  switch (type) {
    case 'question': return '❓';
    case 'guide': return '💡';
    case 'announcement': return '📢';
    case 'discussion': return '💬';
    default: return '💬';
  }
};

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  return (
    <motion.li
      key={thread.id || (thread as any)._id}
      className="thread-card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      whileHover={{ scale: 1.01 }}
      style={{
        background: '#ffffff',
        padding: '1.25rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '12px' }}>
          {getIconEmoji(thread.iconType)}
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link className="thread-link" to={`/threads/${thread.id || (thread as any)._id}`}>
            {thread.title}
          </Link>
          <div className="thread-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span>{formatDate(thread.createdAt)}</span>
            <span>•</span>
            <span className="thread-badge" style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: '500' }}>
              {thread.repliesCount ?? 0} תגובות
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

export default ThreadCard;