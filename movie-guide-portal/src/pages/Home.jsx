import { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import Sidebar from '../components/Sidebar';
import MovieRow from '../components/MovieRow';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/movies')
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error('Error fetching local movie database: ', err));
  }, []);

  // Group movies into arrays of 10
  const chunkedMovies = [];
  for (let i = 0; i < movies.length; i += 10) {
    chunkedMovies.push(movies.slice(i, i + 10));
  }

  const rowTitles = [
    "Top 10 in India Today",
    "Action Extravaganza",
    "Inspirational Movies",
    "Critically Acclaimed",
    "Family Favorites",
    "Thriller & Suspense",
    "Comedy Specials",
    "Hidden Gems",
    "Sci-Fi & Fantasy",
    "Classic Hits",
    "More to Explore"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      {/* Add ml-[80px] to offset the collapsed sidebar width */}
      <div className="flex-1 ml-[80px] pb-20">
        
        {/* ── Hero Banner ── */}
        <HeroBanner />

        {/* ── Rows Section ── */}
        <div className="mt-8 md:mt-12 relative z-20">
          {chunkedMovies.map((chunk, index) => {
            if (chunk.length === 0) return null;
            const title = rowTitles[index] || `Collection ${index + 1}`;
            if (title === "Classic Hits") return null;
            return (
              <MovieRow 
                key={index}
                title={title}
                movies={chunk}
                isTop10={index === 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;