import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { getThreads } from '../api/threadsApi';
import ThreadCard from './ThreadCard';
import { Thread } from '../pages/HomePage';
interface ThreadListProps {
  page: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  localThreads: Thread[];
}

const fetchThreads = async (page: number, searchTerm: string): Promise<any> => {
  return await getThreads(page, searchTerm);
};

const ThreadList: React.FC<ThreadListProps> = ({ page, onPageChange, searchTerm, localThreads }) => {
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
              <ThreadCard key={thread.id || (thread as any)._id} thread={thread} />
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

export default ThreadList;