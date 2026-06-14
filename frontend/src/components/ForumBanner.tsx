import React from 'react';

const ForumBanner: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '160px',
      borderRadius: '24px',
      marginBottom: '2rem',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9'
    }}>
      <img 
        src="../img/צילום מסך 2026-06-14 141309.png"
        alt="רקע קהילת הפורום"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: 0.95
        }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.4)',
        zIndex: 2
      }} />
      
      <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '1rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e3a8a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>קהילת הפורום</h1>
        <p style={{ fontSize: '1rem', color: '#1e40af', margin: 0, fontWeight: '500' }}>מקום לשיתוף, למידה ושיח פתוח ומקצועי</p>
      </div>
    </div>
  );
};

export default ForumBanner;