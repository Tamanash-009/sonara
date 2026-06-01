import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { Play, Shuffle, ChevronLeft, Music, Hash, Disc } from 'lucide-react';
import { cn, formatTime, getHashColor } from '../lib/utils';

export function ArtistDetailView() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const { tracks } = useLibrary();
  const { playTrack, setQueue, currentTrack } = useAudio();

  const artistTracks = tracks.filter(t => t.artist === artistName);
  const albums = Array.from(new Set(artistTracks.map(t => t.album)));

  if (artistTracks.length === 0) return null;

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <header className="relative py-12 flex flex-col items-center text-center gap-8">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-48 h-48 rounded-full glass border-4 border-white/5 flex items-center justify-center text-white/20 font-black text-7xl shadow-3xl relative overflow-hidden group">
           <div 
            className="absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-125 opacity-40" 
            style={{ backgroundColor: getHashColor(artistName || '') }}
           />
           <span className="relative z-10 drop-shadow-2xl">{artistName?.charAt(0).toUpperCase()}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Artist</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tightest uppercase italic leading-none">{artistName}</h1>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Disc size={14} className="text-brand-primary" />
              {albums.length} Albums
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2">
              <Hash size={14} />
              {artistTracks.length} Songs
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-6">
            <button 
              onClick={() => {
                playTrack(artistTracks[0]);
                setQueue(artistTracks.slice(1));
              }}
              className="px-10 py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-brand-primary transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95"
            >
              <Play size={20} fill="black" /> Play All
            </button>
            <button 
              onClick={() => {
                const shuffled = [...artistTracks].sort(() => Math.random() - 0.5);
                playTrack(shuffled[0]);
                setQueue(shuffled.slice(1));
              }}
              className="px-10 py-5 glass-m text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center gap-3 border border-white/10 shadow-xl hover:scale-105 active:scale-95"
            >
              <Shuffle size={20} /> Shuffle
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <h2 className="text-xl font-black uppercase tracking-widest italic">Popular Tracks</h2>
           <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="space-y-2">
          {artistTracks.map((track, i) => (
            <div 
              key={track.id}
              onClick={() => playTrack(track)}
              className={cn(
                "flex items-center gap-6 p-4 rounded-3xl cursor-pointer transition-all group hover:bg-white/5 border border-transparent",
                currentTrack?.id === track.id ? "bg-brand-primary/10 border-brand-primary/30" : ""
              )}
            >
              <div className="w-8 flex-shrink-0 text-center font-mono text-xs font-black text-slate-600 group-hover:text-brand-primary transition-colors">
                {(i + 1).toString().padStart(2, '0')}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 relative">
                {track.cover ? (
                  <img src={track.cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-white/10"
                    style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                  >
                    <Music size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold truncate text-lg tracking-tight uppercase italic",
                  currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                )}>{track.title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{track.album}</p>
              </div>
              <div className="text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
                {formatTime(track.duration)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
