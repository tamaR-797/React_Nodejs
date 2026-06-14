// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateUser } from '../features/auth/authSlice';
import { getCurrentUser, uploadAvatar } from '../api/usersApi';
import UserAvatar from '../components/UserAvatar';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  
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
      } catch (err) {
        console.error(err);
        setError('שגיאה בטעינת נתוני הפרופיל');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reduxUser]);

const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setUploading(true);
  setError(null);

  try {
    const response = await uploadAvatar(file); 
    
    // תיקון השגיאה: גישה ישירה ל-avatarUrl מתוך ה-response או קסטינג ל-any
    // אם הטיפוס UserProfile מכיל את avatarUrl, השורה הבאה תעבוד מצוין:
    const newAvatarUrl = (response as any).data?.avatarUrl || (response as any).avatarUrl;

    // 1. עדכון ה-State המקומי של העמוד
    if (profile) {
      setProfile({ ...profile, avatarUrl: newAvatarUrl });
    }

    // 2. עדכון ה-Redux Store כדי שכל האתר יתעדכן (למשל ה-Navbar)
    if (reduxUser) {
      const updatedUserPayload = {
        ...reduxUser,
        avatarUrl: newAvatarUrl,
      };
      dispatch(updateUser(updatedUserPayload));

      // 3. עדכון ה-LocalStorage כדי שהשינוי יישמר גם בריענון
      localStorage.setItem(
        'auth',
        JSON.stringify({ token, user: updatedUserPayload })
      );
    }
  } catch (err: any) {
    setError(err.message || 'העלאת התמונה נכשלה. אנא נסי קובץ אחר.');
  } finally {
    setUploading(false);
  }
};

  if (!reduxUser) return <p style={{ padding: '2rem', textAlign: 'center' }}>אנא התחברי כדי לצפות בפרופיל.</p>;

  return (
    <main className="page-shell" style={{ direction: 'rtl' }}>
      <section className="profile-card">
        {loading ? (
          <p>טוען פרופיל...</p>
        ) : (
          <>
            <div className="profile-header" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <UserAvatar name={profile?.name || reduxUser.name} avatarUrl={profile?.avatarUrl} size={100} />
              <div>
                <h1>{profile?.name}</h1>
                <p className="profile-email">{profile?.email}</p>
                <span className="profile-role-badge">
                  {profile?.role === 'Admin' ? 'מנהל מערכת' : 'משתמש'}
                </span>
              </div>
            </div>

            <label className="avatar-upload-btn" style={{ display: 'inline-block', marginTop: '1rem', cursor: 'pointer', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', borderRadius: '8px' }}>
              {uploading ? 'מעלה...' : 'שנה תמונת פרופיל'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} hidden />
            </label>

            {error && <p className="error-text" style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}

            <div className="profile-stats" style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
              <div className="profile-stat">
                <span className="profile-stat-num" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>{profile?.threadsCount ?? 0}</span>
                <span className="profile-stat-label">אשכולות</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-num" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>{profile?.commentsCount ?? 0}</span>
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