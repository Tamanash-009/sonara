import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { Play, Shuffle, ChevronLeft, ListMusic, Clock, Trash2, MoreHorizontal, Music } from 'lucide-react';
import { cn, formatTime } from '../lib/utils';

export function PlaylistDetailView() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playlists, tracks, removeFromPlaylist } = useLibrary();
  const { playTrack, setQueue, currentTrack } = useAudio();

  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return null;

  const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));
  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <header className="flex flex-col md:flex-row items-end gap-10 relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3.5rem] glass overflow-hidden shadow-3xl border border-white/10 flex items-center justify-center relative group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-indigo-500/10" />
          <ListMusic size={120} className="text-brand-primary group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Playlist</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest uppercase italic leading-none">{playlist.name}</h1>
          </div>

          <div className="flex items-center gap-6 text-xs font-black text-slate-500 uppercase tracking-widest">
            <div>{playlistTracks.length} Tracks</div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2">
              <Clock size={14} />
              {Math.floor(totalDuration / 60)} min
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
              <Trash2 size={14} /> Delete
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => {
                if (playlistTracks.length > 0) {
                  playTrack(playlistTracks[0]);
                  setQueue(playlistTracks.slice(1));
                }
              }}
              className="flex items-center gap-3 px-10 py-5 bg-brand-primary text-black rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              disabled={playlistTracks.length === 0}
            >
              <Play size={20} fill="black" /> Play All
            </button>
            <button 
              onClick={() => {
                const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
                if (shuffled.length > 0) {
                  playTrack(shuffled[0]);
                  setQueue(shuffled.slice(1));
                }
              }}
              className="flex items-center gap-3 px-10 py-5 bg-white/5 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
              disabled={playlistTracks.length === 0}
            >
              <Shuffle size={20} /> Shuffle
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {playlistTracks.length > 0 ? (
          playlistTracks.map((track, i) => (
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
              <div className="w-12 h-12 rounded-xl border border-white/5 overflow-hidden flex-shrink-0">
                 {track.cover ? <img src={track.cover} alt="" className="w-full h-full object-cover" /> : <Music size={18} className="m-auto text-white/5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold truncate text-lg tracking-tight uppercase italic",
                  currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                )}>{track.title}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{track.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
                  {formatTime(track.duration)}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(playlistId!, track.id);
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center glass rounded-[48px] border border-white/5">
             <ListMusic size={48} className="mx-auto mb-4 text-white/5" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">This playlist is empty</p>
             <button 
              onClick={() => navigate('/library')}
              className="mt-6 text-brand-primary text-xs font-black uppercase tracking-widest hover:underline"
             >
               Go to Library to add songs
             </button>
          </div>
        )}
      </section>
    </div>
  );
}
