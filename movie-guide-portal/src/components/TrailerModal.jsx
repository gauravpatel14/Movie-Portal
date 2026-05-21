import { X } from 'lucide-react';

function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
  // If the boolean state evaluates to false, render nothing on screen
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}
    onClick={onClose} // Clicking the background mask shadow exits the view
    >
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '800px',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '10px',
      }}
      onClick={(e) => e.stopPropagation()} // Stop click propagation from bubbling up and triggering onClose
      >
        {/* Header Block Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px 10px 10px' }}>
          <h3 style={{ margin: 0, color: '#f5c518', fontSize: '1.1rem' }}>Trailer: {movieTitle}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Responsive Aspect Ratio Video Container */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          <iframe
            src={trailerUrl}
            title={`${movieTitle} Official Trailer`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '0',
              borderRadius: '4px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;