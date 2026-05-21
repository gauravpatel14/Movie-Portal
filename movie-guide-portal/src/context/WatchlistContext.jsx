import { createContext, useState, useEffect, useCallback } from 'react';

export const WatchlistContext = createContext();

const STORAGE_KEY = 'movie_portal_watchlist';
// Bump this version whenever the data schema changes — old cache is auto-wiped
const CACHE_VERSION = 'v3';
const VERSION_KEY = 'movie_portal_watchlist_version';

// Real movie IDs are numeric (json-server). YouTube IDs are 11-char alphanumeric.
const isValidMovieId = (id) => id != null && /^\d+$/.test(String(id));
const movieKey = (movie) => movie?.title?.toLowerCase().trim() ?? String(movie?.id);

function dedup(list) {
  const seen = new Map();
  list.forEach(item => {
    const k = movieKey(item);
    if (!seen.has(k)) seen.set(k, item);
  });
  return Array.from(seen.values());
}

function loadFromStorage() {
  try {
    // If cache version mismatch, wipe old data entirely
    if (localStorage.getItem(VERSION_KEY) !== CACHE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Only keep entries with valid numeric IDs
    return dedup(parsed.filter(item => isValidMovieId(item.id)));
  } catch {
    return [];
  }
}

function saveToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
  } catch {}
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(loadFromStorage);
  const [backendLoaded, setBackendLoaded] = useState(false);

  // Persist to localStorage on every change (after backend has loaded)
  useEffect(() => {
    if (backendLoaded) saveToStorage(watchlist);
  }, [watchlist, backendLoaded]);

  // Backend is the SINGLE source of truth on startup
  useEffect(() => {
    fetch('http://localhost:5001/watchlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Backend completely replaces the list — no merge, no corruption
          const clean = dedup(data.filter(item => isValidMovieId(item.id)));
          setWatchlist(clean);
          saveToStorage(clean);
        }
        setBackendLoaded(true);
      })
      .catch(() => {
        // Backend offline — use localStorage as fallback
        setBackendLoaded(true);
      });
  }, []);

  const addToWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      if (prev.some(item => movieKey(item) === movieKey(movie))) return prev;
      const updated = [...prev, movie];
      // Persist to backend (fire-and-forget)
      fetch('http://localhost:5001/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movie),
      }).catch(() => {});
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId) => {
    setWatchlist(prev => {
      const updated = prev.filter(item => item.id !== movieId);
      // Remove from backend (fire-and-forget)
      fetch(`http://localhost:5001/watchlist/${movieId}`, { method: 'DELETE' }).catch(() => {});
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((movie) => {
    if (!movie) return false;
    return watchlist.some(item => movieKey(item) === movieKey(movie));
  }, [watchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}