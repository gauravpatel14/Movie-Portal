import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SignedIn, SignedOut, SignIn, useUser, useClerk, UserButton
} from '@clerk/clerk-react';
import { WatchlistContext } from '../context/WatchlistContext';
import Sidebar from '../components/Sidebar';
import { LogOut, Bookmark, User, ChevronRight } from 'lucide-react';

function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { watchlist } = useContext(WatchlistContext);
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto px-5 py-8 flex flex-col gap-4">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-5 rounded-2xl border border-white/10"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.08))' }}>
        <div className="relative shrink-0">
          <img src={user?.imageUrl} alt={user?.fullName}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-purple-500/40" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#080810]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-lg truncate">{user?.fullName || 'User'}</p>
          <p className="text-xs text-white/45 truncate mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold
                           text-purple-300 bg-purple-500/20 border border-purple-500/30 uppercase tracking-wider">
            Premium
          </span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-2 gap-3">
        {[
          { label: 'Watchlist', value: watchlist.length, color: '#6366f1' },
          { label: 'Reviews', value: '0', color: '#a855f7' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-white/8 text-center"
               style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Action Links */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="rounded-xl border border-white/8 overflow-hidden divide-y divide-white/5"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        {[
          { icon: Bookmark, label: 'My Watchlist', sub: `${watchlist.length} saved`, action: () => navigate('/watchlist') },
        ].map(({ icon: Icon, label, sub, action }) => (
          <button key={label} onClick={action}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left group">
            <Icon size={16} className="text-purple-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/35">{sub}</p>
            </div>
            <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </button>
        ))}
      </motion.div>

      {/* Sign Out */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        onClick={() => signOut({ redirectUrl: '/' })}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2
                   text-sm font-semibold text-red-400/80 border border-red-500/20
                   bg-red-500/5 hover:bg-red-500/10 hover:text-red-400 transition-all">
        <LogOut size={14} /> Sign Out
      </motion.button>
    </div>
  );
}

export default function MySpace() {
  return (
    <div className="min-h-screen text-white flex" style={{ background: '#080810' }}>
      <Sidebar />
      <div className="flex-1 ml-[80px] pb-20 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-4 border-b border-white/5"
             style={{ background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-2.5">
            <User size={16} className="text-purple-400" />
            <div>
              <h1 className="text-base font-bold text-white">My Space</h1>
              <p className="text-xs text-white/40">Your profile & account</p>
            </div>
          </div>
        </div>

        {/* Signed Out */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 gap-6">
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600
                             flex items-center justify-center mx-auto mb-4
                             shadow-[0_8px_32px_rgba(139,92,246,0.35)]">
                <User size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Sign in to continue</h2>
              <p className="text-sm text-white/40">Access your profile, watchlist & reviews</p>
            </div>
            <SignIn routing="virtual" />
          </div>
        </SignedOut>

        {/* Signed In */}
        <SignedIn>
          <Dashboard />
        </SignedIn>
      </div>
    </div>
  );
}
