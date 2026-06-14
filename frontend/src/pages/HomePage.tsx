import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';
import CreateThreadForm from '../components/threads/CreateThreadForm';
import { createThread } from '../api/threadsApi';
import ForumBanner from '../components/ForumBanner';
import ThreadList from '../components/ThreadList';
export interface Thread {
  id: string;
  title: string;
  category?: string;
  iconType?: 'discussion' | 'question' | 'guide' | 'announcement';
  createdAt: string;
  repliesCount: number;
}
const HomePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localThreads, setLocalThreads] = useState<Thread[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const handleCreateThread = async (payload: { title: string; content: string; category: string; iconType: string }) => {
    try {
      const response = await createThread(payload);
      const rawData = (response as any).data || response;
      
      const newThreadData: Thread = {
        id: rawData.id || rawData._id,
        title: rawData.title || payload.title,
        category: rawData.category || payload.category,
        iconType: (rawData.iconType || payload.iconType) as any,
        createdAt: rawData.createdAt || new Date().toISOString(),
        repliesCount: rawData.repliesCount ?? 0
      };

      setLocalThreads((prevThreads) => [newThreadData, ...prevThreads]);
      setPage(1);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create thread failed:', error);
      throw error;
    }
  };

  return (
    <main className="page-shell" style={{ direction: 'rtl', padding: '1.5rem' }}>
      
      {/* הבאנר העליון המבודד */}
      <ForumBanner />

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>כל הדיונים</h2>
        </div>
        <motion.button 
          className="button" 
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          style={{ background: '#2563eb', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          + פתיחת אשכול חדש
        </motion.button>
      </header>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} style={{ zIndex: 1000 }}>
          <motion.div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#fff', padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '600px', position: 'relative' }}
          >
            <button 
              className="modal-close" 
              onClick={() => setShowCreateModal(false)}
              aria-label="Close modal"
              style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <CreateThreadForm onCreate={handleCreateThread} />
          </motion.div>
        </div>
      )}

      <div className="search-card" style={{ marginBottom: '1.5rem' }}>
        <input
          type="search"
          className="search-field"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="חיפוש אשכולות לפי כותרת..."
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* רשימת האשכולות */}
      <ThreadList 
        page={page} 
        onPageChange={setPage} 
        searchTerm={debouncedSearchQuery} 
        localThreads={localThreads} 
      />
    </main>
  );
};

export default HomePage;