import { useState, useEffect } from 'react';
import { useUser, SignIn } from '@clerk/clerk-react';
import { Star, ChevronRight, Plus, X, ChevronRight as Next, Lock } from 'lucide-react';

/* Generate simulated rating distribution centred on movie avg */
function buildDist(avg) {
  const peak = Math.round(avg || 7);
  const dist = {};
  for (let i = 1; i <= 10; i++) {
    const d = Math.abs(i - peak);
    dist[i] = Math.max(4, Math.round(90 - d * d * 8));
  }
  return dist;
}

/* Clickable star row */
function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display:'flex', gap:'6px' }}>
      {Array.from({ length:10 }, (_, i) => i + 1).map(n => (
        <Star key={n} size={30}
          style={{ cursor:'pointer', transition:'all 0.1s',
            color: n <= (hov || value) ? '#f5c518' : '#444',
            fill:  n <= (hov || value) ? '#f5c518' : 'none' }}
          onMouseEnter={() => setHov(n)}
          onMouseLeave={() => setHov(0)}
          onClick={() => onChange(n)}/>
      ))}
    </div>
  );
}

export default function ReviewSection({ movieId, movie }) {
  const { isSignedIn, user } = useUser();
  const [reviews, setReviews]     = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [author, setAuthor]       = useState('');
  const [title, setTitle]         = useState('');
  const [comment, setComment]     = useState('');
  const [rating, setRating]       = useState(0);
  const [busy, setBusy]           = useState(false);

  // Auto-fill author from Clerk user
  useEffect(() => {
    if (isSignedIn && user?.fullName) setAuthor(user.fullName);
  }, [isSignedIn, user]);

  useEffect(() => {
    fetch(`http://localhost:5001/reviews?movieId=${movieId}`)
      .then(r => r.json()).then(setReviews).catch(console.error);
  }, [movieId]);

  const avgRating = movie?.rating || 7;
  const dist      = buildDist(avgRating);
  const maxBar    = Math.max(...Object.values(dist));

  const submitReview = async (e) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !rating) return;
    setBusy(true);
    try {
      const res = await fetch('http://localhost:5001/reviews', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ movieId, author:author.trim(), title:title.trim(), comment:comment.trim(), rating,
          date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) }),
      });
      const saved = await res.json();
      setReviews(prev => [saved, ...prev]);
      setModalOpen(false);
      setAuthor(''); setTitle(''); setComment(''); setRating(0);
    } catch (err) { console.error(err); }
    finally { setBusy(false); }
  };

  return (
    <>
      {/* Section header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', borderLeft:'4px solid #f5c518', paddingLeft:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <h2 style={{ margin:0, fontSize:'1.35rem', fontWeight:'700' }}>User Reviews</h2>
          {reviews.length > 0 && <span style={{ color:'#aaa', fontSize:'0.88rem' }}>{reviews.length}</span>}
          <ChevronRight size={16} style={{ color:'#aaa' }}/>
        </div>
        <button onClick={() => {
            if (isSignedIn) setModalOpen(true);
            else setShowSignIn(true);
          }}
          style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color: isSignedIn ? '#5799ef' : '#888', cursor:'pointer', fontWeight:'700', fontSize:'0.9rem' }}>
          {isSignedIn ? <Plus size={15}/> : <Lock size={13}/>}
          {isSignedIn ? 'Review' : 'Sign in to Review'}
        </button>
      </div>

      {/* Rating + histogram */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:'28px', marginBottom:'30px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Star size={48} style={{ color:'#f5c518', fill:'#f5c518' }}/>
          <div>
            <div style={{ fontSize:'3rem', fontWeight:'800', lineHeight:1 }}>
              {typeof avgRating === 'number' ? avgRating.toFixed(1) : avgRating}
            </div>
            <div style={{ color:'#aaa', fontSize:'0.8rem' }}>{(reviews.length * 97 + 3200).toLocaleString()}</div>
          </div>
        </div>
        {/* Bar chart */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:'3px', height:'64px' }}>
          {Object.entries(dist).map(([n, v]) => (
            <div key={n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <div style={{ width:'22px', minHeight:'3px', borderRadius:'2px 2px 0 0', transition:'height 0.3s',
                height:`${Math.round((v / maxBar) * 54)}px`,
                background: parseInt(n) >= Math.round(avgRating) - 1 ? '#5799ef' : '#333' }}/>
              <span style={{ fontSize:'0.68rem', color:'#777' }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured review cards */}
      {reviews.length > 0 && (
        <>
          <h3 style={{ fontWeight:'700', marginBottom:'16px', color:'#eee', fontSize:'1.05rem' }}>Featured Reviews</h3>
          <div style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'8px', marginBottom:'12px' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ minWidth:'260px', maxWidth:'300px', flexShrink:0, background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'#5799ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:'700', color:'#fff', flexShrink:0 }}>
                    {r.author?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize:'0.85rem', color:'#ccc', fontWeight:'600' }}>{r.author}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'3px', marginLeft:'auto' }}>
                    <Star size={12} style={{ color:'#f5c518', fill:'#f5c518' }}/>
                    <span style={{ color:'#f5c518', fontSize:'0.82rem', fontWeight:'700' }}>{r.rating}</span>
                  </div>
                </div>
                {r.title && <p style={{ fontWeight:'700', color:'#eee', margin:'0 0 8px', fontSize:'0.95rem' }}>{r.title}</p>}
                <p style={{ color:'#aaa', fontSize:'0.85rem', lineHeight:'1.6', margin:0, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {r.comment}
                </p>
                {r.date && <p style={{ color:'#555', fontSize:'0.75rem', margin:'10px 0 0' }}>{r.date}</p>}
              </div>
            ))}
            {/* Scroll arrow */}
            <div style={{ minWidth:'48px', display:'flex', alignItems:'center', justifyContent:'center', background:'#2a2a2a', borderRadius:'10px', cursor:'pointer', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='#333'}
              onMouseLeave={e => e.currentTarget.style.background='#2a2a2a'}>
              <Next size={22} style={{ color:'#fff' }}/>
            </div>
          </div>
        </>
      )}

      {reviews.length === 0 && (
        <p style={{ color:'#555', fontStyle:'italic' }}>No reviews yet — be the first!</p>
      )}

      {/* ── REVIEW MODAL ── */}
      {modalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={() => setModalOpen(false)}>
          <div style={{ background:'#fff', borderRadius:'10px', width:'100%', maxWidth:'480px', overflow:'hidden', color:'#000' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ background:'#1a1a1a', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <img src={movie?.poster} alt="" style={{ width:'44px', height:'60px', objectFit:'cover', borderRadius:'4px' }}/>
                <div>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'1rem' }}>{movie?.title}</div>
                  <div style={{ color:'#aaa', fontSize:'0.8rem' }}>{movie?.year} • {movie?.runtime}</div>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'0.88rem', marginTop:'2px' }}>User Review</div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background:'none', border:'none', color:'#aaa', cursor:'pointer', display:'flex' }}>
                <X size={22}/>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={submitReview} style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <div style={{ fontWeight:'700', marginBottom:'2px', color:'#333', display:'flex', justifyContent:'space-between' }}>
                  <span>Your name</span>
                </div>
                <input value={author} onChange={e => setAuthor(e.target.value)} required
                  placeholder="Enter your name"
                  style={{ width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none' }}/>
              </div>

              <div>
                <div style={{ fontWeight:'700', marginBottom:'8px', color:'#333', display:'flex', justifyContent:'space-between' }}>
                  <span>Your rating</span>
                  <span style={{ color:'#888' }}>{rating || '?'}/10</span>
                </div>
                <StarPicker value={rating} onChange={setRating}/>
              </div>

              <div>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Title of your review"
                  style={{ width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none' }}/>
              </div>

              <div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} required rows={5}
                  placeholder="Review"
                  style={{ width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'0.95rem', boxSizing:'border-box', outline:'none', resize:'vertical', fontFamily:'inherit' }}/>
              </div>

              <button type="submit" disabled={busy || !rating}
                style={{ background: (!rating || busy) ? '#93a8d0' : '#136CB2', color:'#fff', border:'none', borderRadius:'24px', padding:'13px', fontWeight:'700', fontSize:'1rem', cursor: (!rating || busy) ? 'not-allowed' : 'pointer', transition:'background 0.2s' }}>
                {busy ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" onClick={() => setModalOpen(false)}
                style={{ background:'#f0f0f0', color:'#333', border:'none', borderRadius:'24px', padding:'13px', fontWeight:'700', fontSize:'1rem', cursor:'pointer' }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── SIGN-IN MODAL ── */}
      {showSignIn && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={() => setShowSignIn(false)}>
          <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSignIn(false)}
              style={{ position:'absolute', top:'-36px', right:0, background:'none', border:'none', color:'#aaa', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:'0.85rem' }}>
              <X size={16}/> Close
            </button>
            <div style={{ marginBottom:'16px', textAlign:'center' }}>
              <p style={{ color:'#fff', fontWeight:'700', fontSize:'1rem', margin:'0 0 4px' }}>Sign in to write a review</p>
              <p style={{ color:'#888', fontSize:'0.82rem', margin:0 }}>Join the community and share your thoughts</p>
            </div>
            <SignIn routing="virtual" fallbackRedirectUrl={window.location.pathname} />
          </div>
        </div>
      )}
    </>
  );
}