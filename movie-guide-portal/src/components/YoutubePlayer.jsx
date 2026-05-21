import { useEffect, useRef } from 'react';

/**
 * Extracts the YouTube video ID from various URL formats:
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 */
function extractVideoId(url) {
  if (!url) return null;
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

// Tracks whether the YT API <script> has already been injected
let apiScriptLoaded = false;

function loadYouTubeAPI() {
  if (apiScriptLoaded || window.YT) return;
  apiScriptLoaded = true;

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
}

function YoutubePlayer({ trailerUrl, autoplay = false }) {
  const containerRef = useRef(null);
  const playerRef    = useRef(null);
  const videoId      = extractVideoId(trailerUrl);

  useEffect(() => {
    if (!videoId) return;

    loadYouTubeAPI();

    function initPlayer() {
      if (!containerRef.current) return;

      // Destroy previous player instance if any (e.g. navigating between movies)
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width:  '100%',
        height: '100%',
        playerVars: {
          autoplay:        autoplay ? 1 : 0,
          rel:             0,   // Don't show related videos from other channels
          modestbranding:  1,   // Minimal YouTube branding
          controls:        1,
          fs:              1,   // Allow fullscreen
        },
        events: {
          onError: (e) => console.warn('YouTube Player error:', e.data),
        },
      });
    }

    // If the API is already ready, init immediately
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Otherwise queue up after API loads
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      // Cleanup on unmount or videoId change
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [videoId, autoplay]);

  if (!videoId) {
    return (
      <div style={{
        width: '100%', paddingTop: '56.25%', position: 'relative',
        background: '#1a1a1a', borderRadius: '10px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#555',
        }}>
          No trailer available
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop: '56.25%',
      borderRadius: '10px', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    }}>
      {/* The YT.Player mounts directly onto this div */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
        }}
      />
    </div>
  );
}

export default YoutubePlayer;
