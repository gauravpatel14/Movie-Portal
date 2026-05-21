import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Monitor, Volume2, Bell, Check } from 'lucide-react';

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-all duration-300 ${checked ? 'bg-purple-600' : 'bg-white/15'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/6">
        <Icon size={16} className="text-purple-400" />
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border
              ${value === opt
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/80'}`}>
            {value === opt && <Check size={11} className="inline mr-1" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const [quality, setQuality] = useState('Auto');
  const [audioLang, setAudioLang] = useState('English');
  const [subtitles, setSubtitles] = useState('Off');
  const [releaseAlerts, setReleaseAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [autoLower, setAutoLower] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#080810' }}>
      <Sidebar />
      <div className="flex-1 ml-[80px] pb-20 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-4 border-b border-white/5"
             style={{ background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)' }}>
          <h1 className="text-base font-bold text-white">Settings</h1>
          <p className="text-xs text-white/40">Playback & notification preferences</p>
        </div>

        <div className="max-w-lg mx-auto px-6 py-6 flex flex-col gap-4">
          {/* Streaming Quality */}
          <Section title="Streaming Quality" icon={Monitor}>
            <RadioGroup
              label="Video Quality"
              value={quality}
              onChange={setQuality}
              options={['Auto', '1080p Full HD', '720p', '480p']}
            />
            <Toggle
              label="Auto-reduce on slow connection"
              description="Lowers quality to prevent buffering"
              checked={autoLower}
              onChange={setAutoLower}
            />
          </Section>

          {/* Audio & Subtitles */}
          <Section title="Audio & Subtitles" icon={Volume2}>
            <RadioGroup
              label="Audio Language"
              value={audioLang}
              onChange={setAudioLang}
              options={['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada']}
            />
            <RadioGroup
              label="Subtitles"
              value={subtitles}
              onChange={setSubtitles}
              options={['Off', 'English', 'Hindi', 'Tamil']}
            />
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={Bell}>
            <Toggle
              label="New Release Alerts"
              description="When watchlisted movies get new content"
              checked={releaseAlerts}
              onChange={setReleaseAlerts}
            />
            <Toggle
              label="Watchlist Updates"
              description="Before movies expire from platform"
              checked={watchlistAlerts}
              onChange={setWatchlistAlerts}
            />
            <Toggle
              label="Weekly Digest"
              description="Curated weekly summary of top picks"
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </Section>

          <button onClick={handleSave}
                     className={`w-full py-3 rounded-xl font-semibold text-sm text-white
                              transition-all shadow-lg flex items-center justify-center gap-2
                              ${saved
                                ? 'bg-green-600 hover:opacity-90'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90'}`}>
            {saved ? <><Check size={15} /> Saved!</> : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
