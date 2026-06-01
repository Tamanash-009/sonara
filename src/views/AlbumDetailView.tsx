import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { Play, Shuffle, ChevronLeft, Music, Clock, Calendar } from 'lucide-react';
import { cn, formatTime, getHashColor } from '../lib/utils';

export function AlbumDetailView() {
  const { albumName } = useParams();
  const navigate = useNavigate();
  const { tracks } = useLibrary();
  const { playTrack, setQueue, currentTrack } = useAudio();

  const albumTracks = tracks.filter(t => t.album === albumName).sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
  const firstTrack = albumTracks[0];
  const totalDuration = albumTracks.reduce((acc, t) => acc + t.duration, 0);

  if (albumTracks.length === 0) return null;

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <header className="flex flex-col md:flex-row items-end gap-10">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3.5rem] glass overflow-hidden shadow-3xl border border-white/10 relative group shrink-0">
          {firstTrack?.cover ? (
            <img src={firstTrack.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white/10"
              style={{ backgroundColor: getHashColor(albumName || firstTrack?.artist || '') }}
            >
              <Music size={100} className="group-hover:scale-125 transition-transform duration-700" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Album</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest uppercase italic leading-none">{albumName}</h1>
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">{firstTrack?.artist}</p>
          </div>

          <div className="flex items-center gap-6 text-xs font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-primary" />
              {firstTrack?.year || 'Unknown Year'}
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div>{albumTracks.length} Tracks</div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2">
              <Clock size={14} />
              {Math.floor(totalDuration / 60)} min
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => {
                playTrack(albumTracks[0]);
                setQueue(albumTracks.slice(1));
              }}
              className="flex items-center gap-3 px-10 py-5 bg-brand-primary text-black rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={20} fill="black" /> Play All
            </button>
            <button 
              onClick={() => {
                const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
                playTrack(shuffled[0]);
                setQueue(shuffled.slice(1));
              }}
              className="flex items-center gap-3 px-10 py-5 bg-white/5 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all border border-white/10"
            >
              <Shuffle size={20} /> Shuffle
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-2">
        {albumTracks.map((track, i) => (
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
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-bold truncate text-lg tracking-tight uppercase italic",
                currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
              )}>{track.title}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{track.artist}</p>
            </div>
            <div className="text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
              {formatTime(track.duration)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
