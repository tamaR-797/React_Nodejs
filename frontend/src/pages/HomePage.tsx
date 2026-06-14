import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '../hooks/useDebounce';
import CreateThreadForm from '../components/threads/CreateThreadForm';
import { createThread, getThreads } from '../api/threadsApi';
import { formatDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Thread {
  id: string;
  title: string;
  category?: string;
  iconType?: 'discussion' | 'question' | 'guide' | 'announcement';
  createdAt: string;
  repliesCount: number;
}

interface ThreadResponse {
  threads: Thread[];
  total: number;
  currentPage: number;
  totalPages: number;
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

const fetchThreads = async (page: number, searchTerm: string): Promise<any> => {
  return await getThreads(page, searchTerm);
};

const ThreadList: React.FC<{
  page: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  localThreads: Thread[];
}> = ({ page, onPageChange, searchTerm, localThreads }) => {
  const limit = 20;

  const { data, isLoading, isError, error } = useQuery<any, Error>({
    queryKey: ['threads', page, searchTerm],
    queryFn: () => fetchThreads(page, searchTerm),
    placeholderData: (previousData: any) => previousData,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>טוען אשכולות...</div>;
  if (isError) return <div style={{ color: 'red', padding: '1rem' }}>שגיאה בטעינת אשכולות: {error?.message}</div>;

  const filteredLocalThreads = page === 1 
    ? localThreads.filter((thread) => thread.title.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : [];
    
  const fetchedThreads = data?.threads || data?.data || (Array.isArray(data) ? data : []);
  const threadsToDisplay = [...filteredLocalThreads, ...fetchedThreads];
  
  const totalThreadsCount = data?.total || threadsToDisplay.length;
  const totalPages = data?.totalPages || Math.max(Math.ceil(totalThreadsCount / limit), 1);

  return (
    <section style={{ direction: 'rtl' }}>
      {threadsToDisplay.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>לא נמצאו אשכולות תואמים.</p>
      ) : (
        <ul className="thread-list" style={{ padding: 0, listStyle: 'none', display: 'grid', gap: '1rem' }}>
          <AnimatePresence>
            {threadsToDisplay.map((thread) => (
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
            ))}
          </AnimatePresence>
        </ul>
      )}
      
      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button className="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>הקודם</button>
        <span style={{ fontWeight: '500', color: '#334155' }}>עמוד {page} מתוך {totalPages}</span>
        <button className="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>הבא</button>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const [localThreads, setLocalThreads] = useState<Thread[]>([]);

  // תיקון האייקון: הבטחת העברת ה-iconType המקורי שנבחר ישירות לסטייט צד הלקוח
  const handleCreateThread = async (payload: { title: string; content: string; category: string; iconType: string }) => {
    try {
      const response = await createThread(payload);
      const rawData = (response as any).data || response;
      
      const newThreadData: Thread = {
        id: rawData.id || rawData._id,
        title: rawData.title || payload.title,
        category: rawData.category || payload.category,
        iconType: (rawData.iconType || payload.iconType) as any, // וידוא אבטחה שהאייקון הנכון נשמר
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
      
      {/* באנר מעוצב עם תמונת הרקע החדשה מותאמת להגנות נטפרי */}
      <div style={{
        width: '100%',
        height: '160px',
        borderRadius: '24px',
        marginBottom: '2rem',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f1f5f9' // גיבוי צבע נקי במידה והתמונה נשלחת לבדיקה או נחסמת
      }}>
        <img 
          src="../img/צילום מסך 2026-06-14 141309.png" // 🌟 החליפי לנתיב המדויק של התמונה שלך (למשל assets או תיקיית public)
          alt="רקע קהילת הפורום"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            opacity: 0.95
          }}
          onError={(e) => {
            // הגנה חכמה: אם נטפרי חוסם או משהה את התמונה, הקוד ישים רקע חלופי יפה ולא יציג שגיאה ריקה
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* שכבת הגנה כהה עדינה לטקסט מעל התמונה */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.4)',
          zIndex: 2
        }} />
        
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e3a8a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>קהילת הפורום</h1>
          <p style={{ fontSize: '1rem', color: '#1e40af', margin: 0, fontWeight: '500' }}>מקום לשיתוף, למידה ושיח פתוח ומקצועי</p>
        </div>
      </div>

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

      <ThreadList page={page} onPageChange={setPage} searchTerm={debouncedSearchQuery} localThreads={localThreads} />
    </main>
  );
};

export default HomePage;