import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Play, Trash2, Film } from 'lucide-react';
import { WatchlistContext } from '../context/WatchlistContext';
import Sidebar from '../components/Sidebar';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#080810' }}>
      <Sidebar />
      <div className="flex-1 ml-[80px] pb-20 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-5 border-b border-white/5"
             style={{ background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Bookmark size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">My Watchlist</h1>
              <p className="text-xs text-white/40">{watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Empty State */}
          <AnimatePresence>
            {watchlist.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Film size={40} className="text-white/20" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white/70 mb-2">Your watchlist is empty</p>
                  <p className="text-sm text-white/35">Browse the homepage and click <span className="text-white/60 font-semibold">+</span> to save movies here</p>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg">
                  Browse Movies
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {watchlist.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {watchlist.map((movie, idx) => (
                  <motion.div key={movie.id} layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: idx * 0.05 } }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all"
                    style={{ aspectRatio: '2/3' }}>

                    {/* Poster */}
                    <img src={movie.poster} alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => (e.target.src = 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=500')} />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Trash — hover only, top-right */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(movie.id); }}
                        className="w-7 h-7 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white/70 hover:text-red-400 hover:border-red-400/40 transition-colors backdrop-blur-sm">
                        <Trash2 size={13} />
                      </motion.button>
                    </div>

                    {/* Bottom info + Watch button — always visible */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white text-[11px] font-semibold line-clamp-1 leading-tight mb-1">{movie.title}</p>
                      <p className="text-white/40 text-[10px] mb-2">{movie.year}</p>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
                        className="w-full py-1.5 rounded-lg bg-white text-black flex items-center justify-center gap-1.5 font-bold text-[11px] hover:bg-gray-100 transition-colors">
                        <Play size={10} className="fill-black" /> Watch
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
