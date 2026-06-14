import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import { useAppDispatch } from './hooks/useAppDispatch';
import { setCredentials, updateUser } from './features/auth/authSlice';
import { getStoredAuth, isTokenExpired } from './utils/authUtils';
import { getCurrentUser } from './api/usersApi';

// Restore auth from localStorage on app init to persist sessions
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = getStoredAuth();
        if (stored && stored.token && stored.user) {
          if (isTokenExpired(stored.token)) {
            try {
              localStorage.removeItem('auth');
            } catch {
              // ignore
            }
          } else {
            dispatch(setCredentials({ user: stored.user, token: stored.token }));
            try {
              const freshUser = await getCurrentUser();
              dispatch(updateUser({
                name: freshUser.name,
                email: freshUser.email,
                role: freshUser.role,
                avatarUrl: freshUser.avatarUrl,
              }));
              localStorage.setItem('auth', JSON.stringify({
                token: stored.token,
                user: {
                  id: freshUser.id,
                  name: freshUser.name,
                  email: freshUser.email,
                  role: freshUser.role,
                  avatarUrl: freshUser.avatarUrl,
                },
              }));
            } catch {
              // keep stored credentials if refresh fails
            }
          }
        }
      } catch {
        // ignore parse errors
      } finally {
        setAuthLoaded(true);
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <>
      <Navbar />
      {authLoaded ? <AppRoutes /> : null}
    </>
  );
};

export default App;
