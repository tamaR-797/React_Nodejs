import React from 'react';

interface ProfileStatsProps {
  threadsCount: number;
  commentsCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ threadsCount, commentsCount }) => {
  return (
    <div className="profile-stats" style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
      <div className="profile-stat">
        <span className="profile-stat-num" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>
          {threadsCount}
        </span>
        <span className="profile-stat-label">אשכולות</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat-num" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>
          {commentsCount}
        </span>
        <span className="profile-stat-label">תגובות</span>
      </div>
    </div>
  );
};

export default ProfileStats;