import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { WatchlistContext } from '../context/WatchlistContext';

function MovieCard({ movie }) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const isSaved = watchlist.some(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim());
  const savedItem = watchlist.find(item => item.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim());

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    if (isSaved) {
      removeFromWatchlist(savedItem?.id ?? movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="movie-card">
        <div className="poster-container">
          <button 
            className="watchlist-btn" 
            onClick={handleWatchlistClick}
            style={{ color: isSaved ? '#f5c518' : '#fff' }}
          >
            {isSaved ? <BookmarkCheck size={24} style={{ fill: '#f5c518' }} /> : <BookmarkPlus size={24} />}
          </button>
          <img src={movie.poster} alt={movie.title} className="movie-poster" />
        </div>

        <div className="movie-info">
          <div className="rating-row">
            <Star className="star-icon" size={16} />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          <h3 className="movie-title">{movie.title}</h3>

          <div className="meta-row">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;