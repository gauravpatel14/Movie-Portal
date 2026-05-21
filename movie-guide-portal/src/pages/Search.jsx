import { useState, useEffect, useRef, useContext } from 'react';
import { Search as SearchIcon, Clock, X, Play, Plus, Check, VolumeX, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WatchlistContext } from '../context/WatchlistContext';
import Sidebar from '../components/Sidebar';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Dead Trigger', 'Black Friday', 'Sky Sharks', 'The Dark Knight']);
  const [movies, setMovies] = useState([]);
  
  // Hover and video states
  const [hoveredId, setHoveredId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);

  useEffect(() => {
    fetch('http://localhost:5001/movies')
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error('Error fetching movies: ', err));
  }, []);

  const handleMouseEnter = (id) => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredId(id);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredId(null);
  };

  const removeRecentSearch = (e, searchItem) => {
    e.stopPropagation();
    setRecentSearches(recentSearches.filter(item => item !== searchItem));
  };

  const filteredMovies = movies.filter(movie => 
    movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Take the first 14 movies for the trending grid
  const trendingMovies = movies.slice(0, 14);

  const renderMovieCard = (movie) => {
    const isHovered = hoveredId === movie.id;
    const isInWatchlist = watchlist.some(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim());
    const savedItem = watchlist.find(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim());
    const handleWatchlistToggle = (e) => {
      e.stopPropagation();
      if (isInWatchlist) removeFromWatchlist(savedItem?.id ?? movie.id);
      else addToWatchlist(movie);
    };
    let embedUrl = '';
    if (movie.trailerUrl) {
      const videoIdMatch = movie.trailerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${videoIdMatch[1]}&modestbranding=1`;
      }
    }

    return (
      <div 
        key={movie.id}
        onMouseEnter={() => handleMouseEnter(movie.id)}
        onMouseLeave={handleMouseLeave}
        className="relative group/card w-full z-10 hover:z-50"
      >
        {/* The Expanding Hover Card Modal */}
        <div className="absolute top-0 left-0 w-full bg-[#141414] rounded-md transition-all duration-300 origin-bottom md:group-hover/card:scale-[1.3] md:group-hover/card:-translate-y-6 md:group-hover/card:z-50 shadow-lg md:group-hover/card:shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col cursor-pointer border border-transparent md:group-hover/card:border-white/10">
          
          {/* Media Area */}
          <div 
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="relative w-full shrink-0 bg-black transition-all duration-300 overflow-hidden aspect-[2/3] md:group-hover/card:aspect-video"
          >
            {isHovered && embedUrl ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <iframe 
                  src={embedUrl}
                  className="w-full h-full pointer-events-none transform scale-[1.35]"
                  allow="autoplay; encrypted-media"
                  title="Trailer"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute bottom-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50 pointer-events-auto border border-white/20 backdrop-blur-sm"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              </div>
            ) : (
              <img 
                src={movie.poster || movie.image} 
                alt={movie.title} 
                className="w-full h-full object-cover transform md:group-hover/card:scale-110 transition-transform duration-700"
                loading="lazy"
                onError={e => e.target.src='https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=500'}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-60 md:group-hover/card:opacity-100 transition-opacity pointer-events-none" />
          </div>

          {/* Expandable Details Container */}
          <div className="w-full bg-[#141414] max-h-0 md:group-hover/card:max-h-[220px] transition-all duration-300 overflow-hidden flex flex-col justify-start">
             <div className="p-3 pb-4">
               <h4 className="text-white font-extrabold text-[13px] mb-2 line-clamp-1 tracking-wide">{movie.title}</h4>
               
               <div className="flex gap-2 mb-3">
                 <button 
                   onClick={(e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
                   className="flex-1 bg-white text-black py-1.5 rounded font-bold text-[11px] flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors"
                 >
                   <Play size={12} className="fill-black" /> Watch Now
                 </button>
                 <button 
                   onClick={handleWatchlistToggle}
                   className={`w-7 h-7 rounded flex items-center justify-center transition-all shrink-0 border ${
                     isInWatchlist
                       ? 'bg-purple-600/30 border-purple-500/60 text-purple-400'
                       : 'bg-[#2a2a2a] border-white/30 hover:bg-white/20 hover:border-white text-white'
                   }`}
                 >
                   {isInWatchlist ? <Check size={14}/> : <Plus size={16}/>}
                 </button>
               </div>
               
               <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-white/80 font-medium mb-2 flex-wrap">
                 <span className="text-green-500 font-bold">98% Match</span>
                 <span className="text-white/40">•</span>
                 <span>{movie.year || '2024'}</span>
                 <span className="text-white/40">•</span>
                 <span>{movie.runtime || '2h 10m'}</span>
               </div>
               
               <p className="text-[9px] text-white/50 line-clamp-2 leading-relaxed">
                 {movie.description || 'Dive into an unforgettable journey with incredible characters and stunning visuals. Stream now.'}
               </p>
             </div>
          </div>
        </div>
        
        {/* Spacer to preserve grid cell layout */}
        <div className="w-full pointer-events-none aspect-[2/3]" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex">
      <Sidebar />
      <div className="flex-1 ml-[80px] p-6 md:p-10 pb-32">
        
        {/* Top Search Header */}
        <div className="relative mb-8 max-w-4xl z-40">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-[#1c1c24] text-white text-lg rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-all shadow-md"
            placeholder="Movies, shows and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery === '' ? (
          <>
            {/* Recent Search History */}
            {recentSearches.length > 0 && (
              <div className="mb-10 z-30 relative">
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => setSearchQuery(item)}
                      className="flex items-center gap-2 bg-[#1c1c24] hover:bg-[#2a2a35] transition-colors rounded-full px-4 py-2 cursor-pointer border border-white/5 shadow-sm"
                    >
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">{item}</span>
                      <button 
                        onClick={(e) => removeRecentSearch(e, item)}
                        className="ml-1 text-gray-500 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Section */}
            <div className="relative z-20">
              <h2 className="text-xl font-bold text-white mb-6">Trending in India</h2>
              {trendingMovies.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 gap-y-8">
                  {trendingMovies.map((movie) => renderMovieCard(movie))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    Loading Trending Movies...
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Suggestion List Logic */
          <div className="w-full relative z-20">
            <h2 className="text-lg font-semibold text-gray-400 mb-6">Results for "{searchQuery}"</h2>
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 gap-y-8">
                {filteredMovies.map((movie) => renderMovieCard(movie))}
              </div>
            ) : (
              <div className="text-center py-20 max-w-4xl">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Search;
