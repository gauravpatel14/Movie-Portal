import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import {
  Home, Search, Bookmark, Smile
} from 'lucide-react';

const MySpaceIcon = ({ size, className, isActive }) => (
  <div 
    className={`rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shrink-0 transition-all ${className} ${isActive ? 'shadow-[0_0_15px_rgba(59,130,246,0.8)] scale-110' : ''}`} 
    style={{ width: size, height: size }}
  >
    <Smile size={size * 0.6} className="text-white" strokeWidth={2.5} />
  </div>
);

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Bookmark, label: 'My Watchlist', path: '/watchlist' },
  { icon: MySpaceIcon, label: 'My Space', path: '/myspace', isCustom: true },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
      animate={{ width: expanded ? 220 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col items-center bg-black/25 backdrop-blur-2xl border-r border-white/10 overflow-hidden py-8"
    >
      {/* Nav Items Container */}
      <div className="flex-1 flex flex-col gap-6 w-full px-5 mt-4">
        {NAV_ITEMS.map(({ icon: Icon, label, path, isCustom }) => {
          const isActive = location.pathname === path || (path === '/' && location.pathname === '');
          
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="group flex items-center gap-6 w-full transition-all duration-300"
            >
              {isCustom ? (
                <Icon size={28} className="group-hover:scale-110 transition-transform" isActive={isActive} />
              ) : (
                <Icon 
                  size={26} 
                  className={`shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-white ${
                    isActive 
                      ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] scale-110' 
                      : 'text-white/50'
                  }`} 
                  fill={isActive ? "currentColor" : "none"} 
                  strokeWidth={isActive ? 2 : 1.5} 
                />
              )}
              
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`whitespace-nowrap font-semibold text-[17px] transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                        : 'text-white/50 group-hover:text-white'
                    }`}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {/* Clerk UserButton at bottom */}
      <SignedIn>
        <div className="pb-6 flex items-center justify-center">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-8 h-8 ring-2 ring-white/20 rounded-full',
              }
            }}
          />
        </div>
      </SignedIn>
    </motion.div>
  );
}
