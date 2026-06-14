import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/authSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth');
    } catch {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          פורום
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            בית
          </Link>
          <Link to="/profile" className="navbar-link">
            פרופיל
          </Link>
          {user?.role === 'Admin' && (
            <Link to="/admin" className="navbar-link navbar-admin-link">
              ניהול
            </Link>
          )}
          <button type="button" className="navbar-button" onClick={handleLogout}>
            התנתק
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
