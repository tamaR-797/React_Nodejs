import React from 'react';
import { getAvatarUrl } from '../api/usersApi';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, size = 40 }) => {
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
      className="user-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: src ? `url(${src}) center/cover no-repeat` : `hsl(${hue}, 55%, 55%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.38,
        overflow: 'hidden',
      }}
      title={name}
    >
      {!src && initials}
    </div>
  );
};

export default UserAvatar;
