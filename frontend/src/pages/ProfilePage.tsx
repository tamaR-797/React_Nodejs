import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../features/auth/authSlice';
import { getCurrentUser, uploadAvatar } from '../api/usersApi';
import UserAvatar from '../components/UserAvatar';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string | null;
    threadsCount: number;
    commentsCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reduxUser) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser();
        setProfile({
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatarUrl,
          threadsCount: data.threadsCount ?? 0,
          commentsCount: data.commentsCount ?? 0,
        });
        dispatch(updateUser({
          name: data.name,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatarUrl,
        }));
        if (token) {
          localStorage.setItem('auth', JSON.stringify({
            token,
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              avatarUrl: data.avatarUrl,
            },
          }));
        }
      } catch (e) {
        setError('שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, reduxUser, token]);

  if (!reduxUser) {
    return (
      <main className="page-shell">
        <section className="thread-detail-card">
          <h1>פרופיל</h1>
          <p>אתה צריך להיות מחובר כדי לראות את הפרופיל שלך</p>
          <button className="button" onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>
            עבור להתחברות
          </button>
        </section>
      </main>
    );
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const data = await uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
      dispatch(updateUser({ avatarUrl: data.avatarUrl }));
      if (token) {
        localStorage.setItem('auth', JSON.stringify({
          token,
          user: { ...reduxUser, avatarUrl: data.avatarUrl },
        }));
      }
    } catch {
      setError('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const user = profile ?? reduxUser;

  return (
    <main className="page-shell">
      <section className="profile-card">
        {loading ? (
          <p>טוען פרופיל...</p>
        ) : (
          <>
            <div className="profile-header">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={100} />
              <div>
                <h1>{user.name}</h1>
                <p className="profile-email">{user.email}</p>
                <span className="profile-role-badge">
                  {user.role === 'Admin' ? 'מנהל מערכת' : 'משתמש'}
                </span>
              </div>
            </div>

            <label className="avatar-upload-btn">
              {uploading ? 'מעלה...' : 'שנה תמונת פרופיל'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} hidden />
            </label>

            {error && <p className="error-text">{error}</p>}

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-num">{profile?.threadsCount ?? 0}</span>
                <span className="profile-stat-label">אשכולות</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num">{profile?.commentsCount ?? 0}</span>
                <span className="profile-stat-label">תגובות</span>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default ProfilePage;
