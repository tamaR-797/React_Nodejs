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
  author: string;
  createdAt: string;
  repliesCount: number;
}

interface ThreadResponse {
  threads: Thread[];
  total: number;
  currentPage: number;
  totalPages: number;
}

const fetchThreads = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<ThreadResponse> => {
  return await getThreads(page, searchTerm);
};

/**
 * ThreadList
 * Renders a paginated list of threads. Accepts local threads (created client-side)
 * together with fetched threads and applies the current search filter.
 */
const ThreadList: React.FC<{
  page: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  localThreads: Thread[];
}> = ({
  page,
  onPageChange,
  searchTerm,
  localThreads,
}) => {
  const limit = 20;

  // הקוד המתוקן לגרסה 5 של TanStack Query
  const { data, isLoading, isError, error } = useQuery<ThreadResponse, Error>({
    queryKey: ['threads', page, searchTerm],
    queryFn: () => fetchThreads(page, limit, searchTerm),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return <div>Loading threads...</div>;
  }

  if (isError) {
    return <div>Error loading threads: {error?.message || 'Unknown error'}</div>;
  }

  const filteredLocalThreads = localThreads.filter((thread) =>
    thread.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const fetchedThreads = data?.threads ?? [];
  const threads = [...filteredLocalThreads, ...fetchedThreads];
  const totalThreads = threads.length;
  const totalPages = Math.max(Math.ceil(totalThreads / limit), 1);

  return (
    <section>
      {threads.length === 0 ? (
        <p>No threads found.</p>
      ) : (
        <ul className="thread-list">
          <AnimatePresence>
            {threads.map((thread) => (
              <motion.li
                key={thread.id}
                className="thread-card"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link className="thread-link" to={`/threads/${thread.id}`}>
                  {thread.title}
                </Link>
                <div className="thread-meta">
                  <span>By {thread.author}</span>
                  <span>{formatDate(thread.createdAt)}</span>
                  <span className="thread-badge">{thread.repliesCount ?? 0} תגובות</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <div className="pagination-controls">
        <motion.button className="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} whileHover={{ scale: 1.02 }}>
          Previous
        </motion.button>
        <span>
          Page {page} of {totalPages}
        </span>
        <motion.button className="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} whileHover={{ scale: 1.02 }}>
          Next
        </motion.button>
      </div>
    </section>
  );
};

/**
 * HomePage
 * Main listing page for forum threads. Includes a CreateThreadForm and search.
 */
const HomePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const [localThreads, setLocalThreads] = useState<Thread[]>([]);

  const handleCreateThread = async (payload: { title: string; content: string; category: string }) => {
    try {
      const thread = await createThread(payload);
      setLocalThreads((prevThreads) => [thread, ...prevThreads]);
      setPage(1);
    } catch (error) {
      console.error('Create thread failed:', error);
      throw error;
    }
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <h1>Forum Threads</h1>
          <p>Explore the latest discussions, search threads instantly, and jump into the conversation with a polished interface.</p>
        </div>
      </header>

      <CreateThreadForm onCreate={handleCreateThread} />

      <div className="search-card">
        <input
          type="search"
          className="search-field"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search threads by title..."
        />
      </div>

      <ThreadList page={page} onPageChange={setPage} searchTerm={debouncedSearchQuery} localThreads={localThreads} />
    </main>
  );
};

export default HomePage;