import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, ArrowLeft, Clock, Film,
  BookmarkPlus, BookmarkCheck, ChevronRight,
} from 'lucide-react';
import { WatchlistContext } from '../context/WatchlistContext';
import ReviewSection from '../components/ReviewSection';
import MovieCard from '../components/MovieCard';
import YoutubePlayer from '../components/YoutubePlayer';

function avatarColor(name) {
  const p = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#e91e63'];
  let h = 0; for (const c of name) h += c.charCodeAt(0);
  return p[h % p.length];
}

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie]         = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useContext(WatchlistContext);
  const isSaved = movie ? watchlist.some(w => w.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim()) : false;
  const savedItem = movie ? watchlist.find(w => w.title?.toLowerCase().trim() === movie.title?.toLowerCase().trim()) : null;

  useEffect(() => {
    setLoading(true); setError(null); setMovie(null);
    fetch(`http://localhost:5001/movies/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d  => { setMovie(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
    fetch('http://localhost:5001/movies')
      .then(r => r.json()).then(setAllMovies).catch(console.error);
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'70vh', flexDirection:'column', gap:'14px', color:'#aaa' }}>
      <div style={{ fontSize:'2.8rem' }}>🎬</div>
      <p style={{ fontSize:'1rem', margin:0 }}>Loading movie...</p>
    </div>
  );
  if (error || !movie) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'70vh', flexDirection:'column', gap:'14px' }}>
      <p style={{ color:'#f5c518', fontSize:'1.2rem', margin:0 }}>Movie not found</p>
      <Link to="/" style={{ color:'#5799ef', fontSize:'0.9rem' }}>← Back to Home</Link>
    </div>
  );

  const rating = typeof movie.rating === 'number' ? movie.rating : parseFloat(movie.rating) || 0;
  const recs   = allMovies
    .filter(m => m.id !== movie.id && m.genres?.some(g => movie.genres?.includes(g)))
    .slice(0, 6);

  return (
    <div style={{ background:'#0f0f0f', minHeight:'100vh', color:'#fff', fontFamily:"'Segoe UI', Arial, sans-serif" }}>

      {/* ════ HERO BANNER ════ */}
      <div style={{ position:'relative', overflow:'hidden', background:'#0f0f0f' }}>
        {/* Blurred poster as background */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:`url(${movie.poster})`,
          backgroundSize:'cover', backgroundPosition:'center top',
          filter:'blur(28px) brightness(0.22)',
          transform:'scale(1.08)',
        }}/>
        {/* Gradient overlay */}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(15,15,15,0.4) 0%, rgba(15,15,15,0.95) 100%)',
        }}/>

        {/* Hero content */}
        <div style={{ position:'relative', maxWidth:'1200px', margin:'0 auto', padding:'28px 28px 0' }}>
          {/* Back link */}
          <Link to="/" style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            color:'rgba(255,255,255,0.55)', textDecoration:'none', fontSize:'0.85rem',
            marginBottom:'22px', transition:'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color='#fff'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
            <ArrowLeft size={14}/> All Movies
          </Link>

          {/* Title row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'20px', marginBottom:'28px' }}>
            <div>
              <h1 style={{ fontSize:'2.6rem', margin:'0 0 8px', fontWeight:'800', lineHeight:1.15, letterSpacing:'-0.5px' }}>
                {movie.title}
              </h1>
              <div style={{ display:'flex', gap:'12px', color:'rgba(255,255,255,0.55)', fontSize:'0.88rem', alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ color:'rgba(255,255,255,0.8)', fontWeight:'600' }}>{movie.year}</span>
                <span>•</span>
                <span style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <Clock size={13}/>{movie.runtime}
                </span>
              </div>
            </div>
            {/* Rating blocks */}
            <div style={{ display:'flex', gap:'36px', alignItems:'center', flexShrink:0 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.68rem', fontWeight:'700', letterSpacing:'0.12em', marginBottom:'5px' }}>
                  IMDb RATING
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <Star size={22} style={{ color:'#f5c518', fill:'#f5c518' }}/>
                  <span style={{ fontSize:'1.5rem', fontWeight:'800' }}>{rating.toFixed(1)}</span>
                  <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>/10</span>
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.68rem', fontWeight:'700', letterSpacing:'0.12em', marginBottom:'5px' }}>
                  YOUR RATING
                </div>
                <button onClick={() => isSaved ? removeFromWatchlist(savedItem?.id ?? movie.id) : addToWatchlist(movie)}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:'6px',
                    color: isSaved ? '#f5c518' : '#5799ef',
                    transition:'all 0.2s', padding:0,
                  }}>
                  <Star size={20} style={{ fill: isSaved ? '#f5c518' : 'none', color: isSaved ? '#f5c518' : '#5799ef', transition:'all 0.2s' }}/>
                  <span style={{ fontWeight:'700', fontSize:'1rem' }}>{isSaved ? 'Saved' : 'Rate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Media row: Poster | Video ── */}
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 28px', display:'flex', gap:'20px', alignItems:'stretch' }}>
          {/* Poster (flex: 3 to perfectly maintain a 2:3 aspect ratio alongside a 16:9 video which uses flex: 8) */}
          <div style={{ flex: 3, borderRadius:'10px', overflow:'hidden', boxShadow:'4px 0 20px rgba(0,0,0,0.5)' }}>
            <img src={movie.posterlink || movie.poster} alt={movie.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              onError={e => e.target.src='https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=500'}/>
          </div>

          {/* Video player (flex: 8 to maintain 16:9) */}
          <div style={{ flex: 8, minWidth:0, background:'#000', position:'relative', borderRadius: '10px' }}>
            <YoutubePlayer trailerUrl={movie.trailerUrl} autoplay={false}/>
          </div>
        </div>

        {/* bottom fade */}
        <div style={{ height:'32px', background:'linear-gradient(to bottom, transparent, #0f0f0f)' }}/>
      </div>

      {/* ════ CONTENT AREA ════ */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'8px 28px 40px', display:'flex', gap:'40px', flexWrap:'wrap' }}>

        {/* LEFT – Genre, description, director, stars */}
        <div style={{ flex:1, minWidth:'260px' }}>
          {/* Genre pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'22px' }}>
            {movie.genres?.map(g => (
              <span key={g} style={{
                border:'1px solid rgba(255,255,255,0.2)', padding:'4px 16px',
                borderRadius:'20px', fontSize:'0.83rem', color:'rgba(255,255,255,0.7)',
                cursor:'pointer', transition:'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor='#f5c518'; e.target.style.color='#f5c518'; }}
                onMouseLeave={e => { e.target.style.borderColor='rgba(255,255,255,0.2)'; e.target.style.color='rgba(255,255,255,0.7)'; }}>
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          <p style={{ fontSize:'1rem', lineHeight:'1.8', color:'rgba(255,255,255,0.75)', marginBottom:'24px', margin:'0 0 24px' }}>
            {movie.description}
          </p>

          <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.08)', margin:'0 0 18px' }}/>

          {[
            { label:'Director', value: movie.director, isArray: false },
            { label:'Stars',    value: movie.cast,     isArray: true  },
          ].map(row => (
            <div key={row.label}>
              <div style={{ display:'flex', gap:'14px', marginBottom:'16px', flexWrap:'wrap', alignItems:'baseline' }}>
                <span style={{ fontWeight:'700', minWidth:'72px', color:'rgba(255,255,255,0.9)' }}>{row.label}</span>
                {row.isArray ? (
                  <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                    {row.value?.map((v, i) => (
                      <span key={v}>
                        <span style={{ color:'#5799ef', cursor:'pointer', transition:'color 0.2s' }}
                          onMouseEnter={e => e.target.style.color='#82b4f5'}
                          onMouseLeave={e => e.target.style.color='#5799ef'}>{v}</span>
                        {i < row.value.length - 1 && <span style={{ color:'rgba(255,255,255,0.2)' }}> • </span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color:'#5799ef', cursor:'pointer', transition:'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color='#82b4f5'}
                    onMouseLeave={e => e.target.style.color='#5799ef'}>{row.value}</span>
                )}
              </div>
              <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'0 0 18px' }}/>
            </div>
          ))}
        </div>

        {/* RIGHT – Watchlist sidebar */}
        <div style={{ width:'230px', flexShrink:0 }}>
          <button
            onClick={() => isSaved ? removeFromWatchlist(savedItem?.id ?? movie.id) : addToWatchlist(movie)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:'12px',
              background: isSaved ? 'rgba(245,197,24,0.15)' : '#f5c518',
              color: isSaved ? '#f5c518' : '#000',
              border: isSaved ? '1px solid #f5c518' : '1px solid transparent',
              borderRadius:'8px', padding:'13px 16px',
              fontWeight:'700', fontSize:'0.88rem', cursor:'pointer',
              transition:'all 0.25s', boxShadow: isSaved ? 'none' : '0 4px 16px rgba(245,197,24,0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            {isSaved ? <BookmarkCheck size={18}/> : <BookmarkPlus size={18}/>}
            <div style={{ textAlign:'left' }}>
              <div>{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</div>
              <div style={{ fontSize:'0.72rem', fontWeight:'400', opacity:0.7, marginTop:'2px' }}>
                {isSaved ? 'Click to remove' : `Added by ${(rating * 1000 + 2600).toLocaleString()} users`}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ════ TOP CAST ════ */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 28px 40px' }}>
        <SectionHeading title="Top Cast" count={movie.cast?.length}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:'12px' }}>
          {movie.cast?.map(actor => (
            <div key={actor} style={{
              display:'flex', alignItems:'center', gap:'14px',
              padding:'12px 16px', borderRadius:'10px',
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)',
              transition:'all 0.22s', cursor:'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
              <div style={{
                width:'50px', height:'50px', borderRadius:'50%', flexShrink:0,
                background: avatarColor(actor),
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem', fontWeight:'800', color:'#fff',
                boxShadow:`0 2px 8px ${avatarColor(actor)}66`,
              }}>
                {actor.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight:'700', color:'rgba(255,255,255,0.9)', fontSize:'0.88rem' }}>{actor}</div>
                <div style={{ color:'#5799ef', fontSize:'0.76rem', marginTop:'3px' }}>Actor • {movie.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════ REVIEWS ════ */}
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 28px 40px' }}>
        <ReviewSection movieId={id} movie={movie}/>
      </div>

      {/* ════ MORE LIKE THIS ════ */}
      {recs.length > 0 && (
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 28px 60px' }}>
          <SectionHeading title="More Like This" icon={<Film size={16}/>}/>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:'16px' }}>
            {recs.map(m => <MovieCard key={m.id} movie={m}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title, count, icon }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', borderLeft:'3px solid #f5c518', paddingLeft:'12px' }}>
      <h2 style={{ margin:0, fontSize:'1.3rem', fontWeight:'800', letterSpacing:'-0.3px' }}>{title}</h2>
      {count != null && <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>{count}</span>}
      {icon && <span style={{ color:'rgba(255,255,255,0.35)' }}>{icon}</span>}
      <ChevronRight size={16} style={{ color:'rgba(255,255,255,0.3)' }}/>
    </div>
  );
}