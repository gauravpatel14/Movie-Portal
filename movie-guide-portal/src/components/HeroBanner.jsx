import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WatchlistContext } from '../context/WatchlistContext';
import {
  Star, Play, Plus, Check, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─────────────────────────────────────────────
// Top 5 hero movies (hand-picked from db.json)
// ─────────────────────────────────────────────
const HERO_MOVIES = [
  {
    id: '1',
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    runtime: '152 min',
    certification: 'UA',
    language: 'English',
    genres: ['Action', 'Crime', 'Drama'],
    director: 'Christopher Nolan',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    tags: ['Blockbuster', '2008', 'UA', '2h 32m', 'English'],
    poster: '/movieposter/dark.png',
    trailerId: 'EXeTwQWrcwY',
    accent: '#1a6bff',
  },
  {
    id: '7',
    title: 'Vikram',
    year: 2022,
    rating: 8.3,
    runtime: '175 min',
    certification: 'A',
    language: 'Tamil',
    genres: ['Action', 'Thriller', 'Crime'],
    director: 'Lokesh Kanagaraj',
    description:
      'A special agent investigates a murder committed by a masked group of serial killers, uncovering a massive drug syndicate led by a mysterious kingpin.',
    tags: ['Blockbuster', '2022', 'A', '2h 55m', 'Tamil'],
    poster: '/movieposter/vikram.png',
    trailerId: 'OKBMCL-frPU',
    accent: '#ff4f1f',
  },
  {
    id: '16',
    title: 'Kantara',
    year: 2022,
    rating: 8.3,
    runtime: '148 min',
    certification: 'UA',
    language: 'Kannada',
    genres: ['Adventure', 'Action', 'Drama'],
    director: 'Rishab Shetty',
    description:
      'When greed paves the way for betrayal and rebellion, a local champion must defend his village and ancestral forest from dark forces of men and gods alike.',
    tags: ['National Award', '2022', 'UA', '2h 28m', 'Kannada'],
    poster: '/movieposter/kan.png',
    trailerId: '8qZMTI7b1gU',
    accent: '#d4a017',
  },
  {
    id: '8',
    title: 'RRR',
    year: 2022,
    rating: 7.8,
    runtime: '187 min',
    certification: 'UA',
    language: 'Telugu',
    genres: ['Action', 'Drama', 'Period'],
    director: 'S.S. Rajamouli',
    description:
      'A fearless revolutionary and an officer in the British army forge a deep friendship before uncovering each other\'s true identities in pre-independence India.',
    tags: ['Blockbuster', '2022', 'UA', '3h 7m', 'Telugu'],
    poster: '/movieposter/rrr.png',
    trailerId: 'f_vbAtFSEc0',
    accent: '#e63946',
  },
  {
    id: '40',
    title: 'Ratsasan',
    year: 2018,
    rating: 8.4,
    runtime: '170 min',
    certification: 'UA',
    language: 'Tamil',
    genres: ['Thriller', 'Crime', 'Mystery'],
    director: 'Ram Kumar',
    description:
      'An aspiring filmmaker turned police sub-inspector tracks a psychotic serial killer who preys on schoolgirls in a gripping cat-and-mouse chase.',
    tags: ['Critics Choice', '2018', 'UA', '2h 50m', 'Tamil'],
    poster: '/movieposter/rat.png',
    trailerId: 'Gs9YfN0A8_8',
    accent: '#9b5de5',
  },
];

const AUTO_ADVANCE_MS = 7000;

export default function HeroBanner() {
  const [activeIdx, setActiveIdx] = useState(0);
  const autoAdvanceRef = useRef(null);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);

  const current = HERO_MOVIES[activeIdx];
  const isInWatchlist = watchlist.some(item => item.title?.toLowerCase().trim() === current.title?.toLowerCase().trim());
  const savedItem = watchlist.find(item => item.title?.toLowerCase().trim() === current.title?.toLowerCase().trim());

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (isInWatchlist) removeFromWatchlist(savedItem?.id ?? current.id);
    else addToWatchlist(current);
  };

  // ── Auto-advance
  const resetAutoAdvance = useCallback(() => {
    clearInterval(autoAdvanceRef.current);
    autoAdvanceRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % HERO_MOVIES.length);
    }, AUTO_ADVANCE_MS);
  }, []);

  useEffect(() => {
    resetAutoAdvance();
    return () => clearInterval(autoAdvanceRef.current);
  }, [resetAutoAdvance]);

  const goTo = (idx) => {
    setActiveIdx(idx);
    resetAutoAdvance();
  };
  const prev = () => goTo((activeIdx - 1 + HERO_MOVIES.length) % HERO_MOVIES.length);
  const next = () => goTo((activeIdx + 1) % HERO_MOVIES.length);

  return (
    <div className="w-full h-[70vh] md:h-[85vh] min-h-[560px] max-h-[900px] relative font-['Inter']">

      {/* ── MAIN HERO AREA ── */}
      <div
        className="relative overflow-hidden h-full cursor-pointer"
        onClick={() => navigate(`/movie/${current.id}`)}
      >
        {/* ── Background Poster ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`poster-${activeIdx}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${current.poster})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
            }}
          />
        </AnimatePresence>

        {/* ── Gradient Overlays ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'linear-gradient(to right, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.05) 70%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.3) 30%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* ── LEFT CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeIdx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute', bottom: '15%', left: '5%', right: '40%',
              zIndex: 10,
            }}
          >
            {/* Accent bar */}
            <div style={{
              width: 40, height: 3, borderRadius: 2,
              background: current.accent,
              marginBottom: 14,
            }} />

            {/* Title */}
            <h2 style={{
              margin: '0 0 12px',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#fff',
              textShadow: '0 2px 20px rgba(0,0,0,0.7)',
              letterSpacing: '-0.5px',
            }}>
              {current.title}
            </h2>

            {/* IMDb + Tags row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#f5c518', color: '#000',
                fontWeight: 800, fontSize: '0.78rem', padding: '3px 8px', borderRadius: 4,
              }}>
                <Star size={11} fill="#000" /> IMDb {current.rating}
              </span>
              {current.tags.map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '3px 9px', borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.9rem', lineHeight: 1.6,
              margin: '0 0 16px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: 480,
            }}>
              {current.description}
            </p>

            {/* Genre tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {current.genres.map((g, i) => (
                <span key={g} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                  {g}{i < current.genres.length - 1 && <span style={{ marginLeft: 6, color: 'rgba(255,255,255,0.25)' }}>|</span>}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}
              onClick={e => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.04, filter: 'brightness(1.12)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/movie/${current.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 26px',
                  background: `linear-gradient(135deg, ${current.accent} 0%, #9b5de5 100%)`,
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: `0 4px 20px ${current.accent}55`,
                }}
              >
                <Play size={16} fill="#fff" /> Play
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                animate={isInWatchlist ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                onClick={handleWatchlistToggle}
                style={{
                  width: 46, height: 46,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isInWatchlist ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.1)',
                  border: isInWatchlist ? '1.5px solid rgba(139,92,246,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 10, color: isInWatchlist ? '#a78bfa' : '#fff', cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.3s, border-color 0.3s, color 0.3s',
                }}
              >
                <AnimatePresence mode="wait">
                  {isInWatchlist ? (
                    <motion.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                      <Check size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Plus size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── SIDE NAVIGATION ARROWS ── */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-24 z-20 flex items-center justify-start opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="ml-4 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hover:scale-110"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 z-20 flex items-center justify-end opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="mr-4 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all hover:scale-110"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* ── BOTTOM RIGHT: CAROUSEL ── */}
        <div
          style={{
            position: 'absolute', bottom: 28, right: 24,
            zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Prev / Next arrows */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={prev} style={{ ...arrowBtnStyle }}
            ><ChevronLeft size={16} /></motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={next} style={{ ...arrowBtnStyle }}
            ><ChevronRight size={16} /></motion.button>
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: 10 }}>
            {HERO_MOVIES.map((movie, idx) => (
              <motion.div
                key={movie.id}
                onClick={() => goTo(idx)}
                whileHover={{ scale: 1.07 }}
                animate={{
                  opacity: idx === activeIdx ? 1 : 0.55,
                  scale: idx === activeIdx ? 1.06 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: idx === activeIdx ? 90 : 74,
                  height: idx === activeIdx ? 54 : 44,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: idx === activeIdx
                    ? `2px solid ${HERO_MOVIES[activeIdx].accent}`
                    : '2px solid rgba(255,255,255,0.15)',
                  transition: 'width 0.3s, height 0.3s, border-color 0.3s',
                  flexShrink: 0,
                  boxShadow: idx === activeIdx ? `0 0 14px ${HERO_MOVIES[activeIdx].accent}70` : 'none',
                }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </motion.div>
            ))}
          </div>

          {/* Dot progress */}
          <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', marginTop: 2 }}>
            {HERO_MOVIES.map((_, idx) => (
              <motion.div
                key={idx}
                onClick={() => goTo(idx)}
                animate={{ width: idx === activeIdx ? 20 : 6, background: idx === activeIdx ? current.accent : 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
                style={{ height: 4, borderRadius: 3, cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const arrowBtnStyle = {
  width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '50%', color: '#fff', cursor: 'pointer',
  backdropFilter: 'blur(8px)',
};
