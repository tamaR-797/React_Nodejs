import React from 'react';

/**
 * ProfilePage
 * Placeholder user profile page showing basic mock information.
 */
const ProfilePage: React.FC = () => {
  return (
    <main className="page-shell">
      <section className="thread-detail-card">
        <h1>User Profile</h1>
        <p>Manage your personal details and view your forum activity.</p>

        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Name</strong>
            <p>Test User</p>
          </div>
          <div>
            <strong>Email</strong>
            <p>test@example.com</p>
          </div>
          <div>
            <strong>Member since</strong>
            <p>June 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
