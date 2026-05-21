import { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { WatchlistContext } from '../context/WatchlistContext';
import { ChevronRight, ChevronLeft, Play, Plus, Check, VolumeX, Volume2 } from 'lucide-react';

export default function MovieRow({ title, movies, isTop10 = false, isAutoplayRow = false }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayCardId, setAutoplayCardId] = useState(null);
  const autoplayTimerRef = useRef(null);
  // hoverState = { movie, rect } where rect is the card's getBoundingClientRect()
  const [hoverState, setHoverState] = useState(null);
  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  const onAutoplayEnter = useCallback((movieId) => {
    clearTimeout(autoplayTimerRef.current);
    autoplayTimerRef.current = setTimeout(() => setAutoplayCardId(movieId), 300);
  }, []);

  const onAutoplayLeave = useCallback(() => {
    clearTimeout(autoplayTimerRef.current);
    setAutoplayCardId(null);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 5);
    setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => { handleScroll(); }, [movies]);

  // Dismiss popover only when the horizontal SLIDER scrolls (position becomes stale)
  // Do NOT listen to window scroll — it fires during momentum scroll after page scroll
  // and prevents hover from working on lower rows entirely
  useEffect(() => {
    const dismiss = () => setHoverState(null);
    const slider = scrollRef.current;
    slider?.addEventListener('scroll', dismiss);
    return () => slider?.removeEventListener('scroll', dismiss);
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  const onCardEnter = useCallback((movie, e) => {
    clearTimeout(leaveTimerRef.current);
    const cardEl = e.currentTarget;
    hoverTimerRef.current = setTimeout(() => {
      // Re-read rect at fire time so position is accurate after any scroll
      setHoverState({ movie, rect: cardEl.getBoundingClientRect() });
    }, 300);
  }, []);

  const onCardLeave = useCallback(() => {
    clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setHoverState(null), 200);
  }, []);

  const onPopoverEnter = useCallback(() => clearTimeout(leaveTimerRef.current), []);
  const onPopoverLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => setHoverState(null), 200);
  }, []);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);

  const getEmbedUrl = (trailerUrl) => {
    if (!trailerUrl) return '';
    const m = trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?/\s]{11})/);
    if (!m) return '';
    return `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${m[1]}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`;
  };

  // Compute FIXED-position style so popover floats above everything regardless of stacking context
  const getPopoverStyle = (rect) => {
    const SCALE = 1.35;
    const popW = rect.width * SCALE;
    const sideOffset = (popW - rect.width) / 2;
    let left = rect.left - sideOffset;
    const LIFT = 28; // px to float above the original card top
    let top = rect.top - LIFT;

    // Clamp to viewport so it doesn't go off-screen
    if (left < 8) left = 8;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - 8 - popW;
    if (top < 8) top = rect.bottom + 8; // flip below if too close to top

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popW}px`,
      zIndex: 9999,
    };
  };

  const cardH = isTop10 ? 260 : 250;

  return (
    <>
      <div className="relative mb-10 px-4 md:px-8">
        {/* Row title */}
        <div className="flex justify-between items-end mb-5 group cursor-pointer">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <div className="flex items-center gap-1 text-white/50 group-hover:text-white transition-colors text-sm font-semibold">
            <span>View All</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Slider wrapper */}
        <div className="relative group/row">
          {/* Left arrow */}
          {showLeft && (
            <div className="absolute inset-y-0 left-0 w-16 z-20 bg-gradient-to-r from-[#0a0a0a]/95 to-transparent flex items-center justify-start opacity-70 group-hover/row:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={() => scroll('left')}
                className="ml-2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all hover:scale-110 pointer-events-auto shadow-lg"
              >
                <ChevronLeft size={32} />
              </button>
            </div>
          )}

          {/* Cards strip — overflow-x: auto, overflow-y: clip so layout is clean */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto overflow-y-clip"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie, index) => {
              const isNewlyAdded = [2022, 2023, 2024].includes(movie.year);
              const isHindi = movie.genres?.includes('Bollywood') || movie.language === 'Hindi';

              return (
                <div
                  key={movie.id}
                  onMouseEnter={(e) => {
                    if (isAutoplayRow) onAutoplayEnter(movie.id);
                    else onCardEnter(movie, e);
                  }}
                  onMouseLeave={() => {
                    if (isAutoplayRow) onAutoplayLeave();
                    else onCardLeave();
                  }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className={`relative flex-shrink-0 snap-start cursor-pointer rounded-md overflow-hidden
                    transition-transform duration-300 hover:brightness-110 hover:scale-105
                    ${isTop10 ? 'w-[200px] md:w-[220px]' : 'w-[140px] md:w-[170px]'}`}
                  style={{ height: `${cardH}px` }}
                >
                  {/* Inline autoplay overlay for isAutoplayRow */}
                  {isAutoplayRow && autoplayCardId === movie.id && getEmbedUrl(movie.trailerUrl) && (
                    <div className="absolute inset-0 z-10 overflow-hidden">
                      <iframe
                        src={`${getEmbedUrl(movie.trailerUrl)}&mute=1`}
                        className="absolute inset-0 w-full h-full pointer-events-none scale-[1.12]"
                        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(1.15)' }}
                        allow="autoplay; encrypted-media"
                        title="Preview"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    </div>
                  )}
                  {/* Top 10 number */}
                  {isTop10 && (
                    <div
                      className="absolute left-[-8px] bottom-[-10px] z-10 text-[110px] md:text-[140px]
                                 font-black leading-none pointer-events-none select-none"
                      style={{
                        background: 'linear-gradient(180deg,#fff 0%,#555 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.9))',
                      }}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* Poster image */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className={`h-full object-cover ${isTop10 ? 'w-[calc(100%-44px)] ml-auto' : 'w-full'}`}
                    loading="lazy"
                    onError={e => (e.target.src = 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=500')}
                  />

                  {/* Bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
                    {isHindi && (
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded border border-white/10">
                        हिन्दी
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          {showRight && (
            <div className="absolute inset-y-0 right-0 w-16 z-20 bg-gradient-to-l from-[#0a0a0a]/95 to-transparent flex items-center justify-end opacity-70 group-hover/row:opacity-100 transition-opacity pointer-events-none">
              <button
                onClick={() => scroll('right')}
                className="mr-2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all hover:scale-110 pointer-events-auto shadow-lg"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Hover popover rendered directly into document.body via portal ── */}
      {hoverState &&
        createPortal(
          <HoverCard
            movie={hoverState.movie}
            rect={hoverState.rect}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            getEmbedUrl={getEmbedUrl}
            getPopoverStyle={getPopoverStyle}
            onPopoverEnter={onPopoverEnter}
            onPopoverLeave={onPopoverLeave}
            navigate={navigate}
            watchlist={watchlist}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
          />,
          document.body
        )}
    </>
  );
}

function HoverCard({ movie, rect, isMuted, setIsMuted, getEmbedUrl, getPopoverStyle, onPopoverEnter, onPopoverLeave, navigate, watchlist, addToWatchlist, removeFromWatchlist }) {
  const embedUrl = getEmbedUrl(movie.trailerUrl);
  const style = { ...getPopoverStyle(rect), boxShadow: '0 25px 80px rgba(0,0,0,0.95)' };
  const isInWatchlist = watchlist?.some(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim()) ?? false;
  const savedItem = watchlist?.find(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim());
  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (isInWatchlist) removeFromWatchlist(savedItem?.id ?? movie.id);
    else addToWatchlist(movie);
  };

  return (
    <div
      style={style}
      onMouseEnter={onPopoverEnter}
      onMouseLeave={onPopoverLeave}
      className="rounded-xl overflow-hidden bg-[#181818] border border-white/10 flex flex-col"
    >
      {/* Trailer / Poster area (16:9) */}
      <div
        className="relative w-full bg-black overflow-hidden cursor-pointer"
        style={{ aspectRatio: '16/9' }}
        onClick={() => navigate(`/movie/${movie.id}`)}
      >
        {embedUrl ? (
          <>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full pointer-events-none scale-[1.4]"
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
            {/* Mute button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsMuted((m) => !m); }}
              className="absolute bottom-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm border border-white/20
                         rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10 pointer-events-auto"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </>
        ) : (
          <>
            <img
              src={movie.poster}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* Info panel */}
      <div className="p-3 pb-4">
        <h4 className="text-white font-extrabold text-[13px] mb-2 line-clamp-1 tracking-wide">
          {movie.title}
        </h4>

        {/* Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="flex-1 bg-white text-black py-1.5 rounded font-bold text-[11px]
                       flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors"
          >
            <Play size={12} className="fill-black" /> Watch Now
          </button>
          <button
            onClick={handleWatchlistToggle}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all shrink-0
                       ${
                         isInWatchlist
                           ? 'bg-purple-600/30 border border-purple-500/60 text-purple-400'
                           : 'bg-[#2a2a2a] border border-white/30 hover:bg-white/20 hover:border-white text-white'
                       }`}
          >
            {isInWatchlist ? <Check size={15} /> : <Plus size={15} />}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium mb-2 flex-wrap">
          <span className="text-green-400 font-bold">98% Match</span>
          <span className="text-white/30">•</span>
          <span>{movie.year || '2024'}</span>
          <span className="text-white/30">•</span>
          <span className="bg-white/20 px-1 rounded border border-white/10 text-[9px] font-bold">U/A 16+</span>
          <span className="text-white/30">•</span>
          <span>{movie.runtime || '2h 10m'}</span>
        </div>

        {/* Description */}
        <p className="text-[10px] text-white/50 line-clamp-2 leading-relaxed">
          {movie.description || 'Stream now for an unforgettable cinematic experience.'}
        </p>
      </div>
    </div>
  );
}
