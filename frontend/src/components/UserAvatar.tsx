import React, { useState } from 'react';
import { getAvatarUrl } from '../api/usersApi';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  email?: string; // הוספת אימייל אופציונלי לכרטיס הריחוף
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, size = 40, email }) => {
  const [isHovered, setIsHovered] = useState(false);
  const src = getAvatarUrl(avatarUrl);
  
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="user-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: src ? `url(${src}) center/cover no-repeat` : `hsl(${hue}, 55%, 55%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: size * 0.38,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        {!src && initials}
      </div>

      {/* כרטיס ריחוף מודרני ונקי */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '1rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          width: '200px',
          textAlign: 'center',
          border: '1px solid #f1f5f9',
          direction: 'rtl'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: src ? `url(${src}) center/cover no-repeat` : `hsl(${hue}, 55%, 55%)`,
            margin: '0 auto 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {!src && initials}
          </div>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{name}</h4>
          {email && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{email}</p>}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', display: 'inline-block', color: '#475569' }}>
            חבר פורום
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;