import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '../hooks/useAppSelector';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import ThreadPage from '../pages/ThreadPage';

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
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
