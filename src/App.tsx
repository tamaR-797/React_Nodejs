import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import { useAppDispatch } from './hooks/useAppDispatch';
import { setCredentials } from './features/auth/authSlice';
import { getStoredAuth, isTokenExpired } from './utils/authUtils';

// Restore auth from localStorage on app init to persist sessions
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = getStoredAuth();
      if (stored && stored.token && stored.user) {
        if (isTokenExpired(stored.token)) {
          try {
            localStorage.removeItem('auth');
          } catch (e) {
            // ignore
          }
        } else {
          dispatch(setCredentials({ user: stored.user, token: stored.token }));
        }
      }
    } catch (e) {
      // ignore parse errors
    } finally {
      setAuthLoaded(true);
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      {authLoaded ? <AppRoutes /> : null}
    </>
  );
};

export default App;
