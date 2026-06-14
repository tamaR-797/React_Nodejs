import React from 'react';

interface AISummaryModalProps {
  threadId: string;
  onClose: () => void;
}

const AISummaryModal: React.FC<AISummaryModalProps> = ({ onClose }) => {
  return (
    <div style={modalOverlayStyles}>
      <div style={modalStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>AI Summary</h2>
          <button type="button" onClick={onClose} style={closeButtonStyles}>
            Close
          </button>
        </div>

        <p>
          AI summary is not available for this backend integration. The current backend does not expose a summary endpoint,
          so this feature cannot be generated at this time.
        </p>
      </div>
    </div>
  );
};

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyles: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  width: '90%',
  maxWidth: '600px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
};

const closeButtonStyles: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1rem',
};

export default AISummaryModal;
