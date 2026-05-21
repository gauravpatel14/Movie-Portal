import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import MySpace from './pages/MySpace';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ClerkProvider needs to live inside BrowserRouter so it can use useNavigate
function ClerkWithRouter({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      fallbackRedirectUrl="/myspace"
    >
      {children}
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <WatchlistProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/myspace" element={<MySpace />} />
          </Routes>
        </WatchlistProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

export default App;