import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { History, Play, Clock, Music, MoreVertical } from 'lucide-react';
import { cn, formatTime, getHashColor } from '../lib/utils';
import { EmptyState } from '../components/EmptyState';
import { useState } from 'react';
import { Track } from '../types';
import { TrackActionsMenu } from '../components/TrackActionsMenu';

export function HistoryView() {
  const { smartPlaylists } = useLibrary();
  const { playTrack, currentTrack } = useAudio();
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const historyPlaylist = smartPlaylists.find(sp => sp.id === 'recently-played');
  const historyTracks = historyPlaylist?.tracks || [];

  const formatLastPlayed = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-slide-up pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tightest uppercase italic text-white/90">Playback History</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your recently played tracks</p>
        </div>
        <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 text-brand-primary shadow-xl">
          <History size={28} />
        </div>
      </header>

      {historyTracks.length === 0 ? (
        <EmptyState 
          icon={History}
          title="No History Yet"
          description="Your playback history will appear here once you start listening to some music."
        />
      ) : (
        <div className="space-y-2">
          {historyTracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => playTrack(track)}
              className={cn(
                "flex items-center gap-6 p-4 rounded-[2.5rem] cursor-pointer transition-all group hover:bg-white/5 border border-transparent",
                currentTrack?.id === track.id ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : ""
              )}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-white/5 overflow-hidden flex-shrink-0 relative shadow-lg">
                {track.cover ? (
                  <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-white/10"
                    style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                  >
                    <Music size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                  <Play size={24} fill="currentColor" className="text-brand-primary translate-x-0.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold truncate text-lg tracking-tight uppercase italic",
                  currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                )}>{track.title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{track.artist}</p>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Clock size={12} />
                {track.lastPlayed ? formatLastPlayed(track.lastPlayed) : 'Unknown'}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
                  {formatTime(track.duration)}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuTrack(track);
                    setMenuPosition({ x: e.clientX, y: e.clientY });
                  }}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {menuTrack && (
        <TrackActionsMenu 
          track={menuTrack}
          isOpen={!!menuTrack}
          onClose={() => setMenuTrack(null)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
