import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '../hooks/useAppSelector';

const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ThreadPage = lazy(() => import('../pages/ThreadPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * AppRoutes
 * Central route definitions. Uses AnimatePresence/motion for page transitions.
 */
const AppRoutes: React.FC = () => {
  const location = useLocation();

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22 },
  } as const;

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading page...</div>}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={<motion.div {...pageTransition}><LoginPage /></motion.div>}
          />

          <Route
            path="/register"
            element={<motion.div {...pageTransition}><RegisterPage /></motion.div>}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}><HomePage /></motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/threads/:id"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}><ThreadPage /></motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <motion.div {...pageTransition}><ProfilePage /></motion.div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <motion.div {...pageTransition}><AdminPage /></motion.div>
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AppRoutes;
