import { Plus, ListMusic, Play, Shuffle, Star, History, TrendingUp, Clock, Music } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/utils';
import { Playlist, Track } from '../types';

export function PlaylistsView() {
  const { playlists, createPlaylist, tracks, smartPlaylists } = useLibrary();
  const { playTrack, setQueue, setShuffle } = useAudio();

  const handlePlaySmart = (smartTracks: Track[]) => {
    if (smartTracks.length === 0) return;
    playTrack(smartTracks[0]);
    setQueue(smartTracks.slice(1));
  };

  const shufflePlaylist = (playlist: Playlist) => {
    const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));
    if (playlistTracks.length === 0) return;

    const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0]);
    setQueue(shuffled.slice(1));
    setShuffle(true);
  };

  const handleCreate = () => {
    const name = prompt('Playlist name:');
    if (name) createPlaylist(name);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight uppercase italic text-white/90">Playlists</h2>
        <button 
          onClick={handleCreate}
          className="p-4 bg-brand-primary text-black rounded-3xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Smart Playlists */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[.3em] ml-2">Smart Collections</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {smartPlaylists.map((sp) => {
            const Icon = sp.id === 'favorites' ? Star : 
                         sp.id === 'most-played' ? TrendingUp : 
                         sp.id === 'recently-played' ? History : Clock;
            
            return (
              <div 
                key={sp.id}
                onClick={() => handlePlaySmart(sp.tracks)}
                className="group relative h-32 rounded-[32px] glass overflow-hidden cursor-pointer hover:bg-white/10 transition-all border border-white/5 active:scale-95"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-primary/20 group-hover:h-full transition-all duration-500 opacity-20 pointer-events-none" />
                <div className="h-full flex flex-col justify-between p-5 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6",
                    sp.id === 'favorites' ? "bg-amber-500/10 text-amber-500" :
                    sp.id === 'most-played' ? "bg-rose-500/10 text-rose-500" :
                    sp.id === 'recently-played' ? "bg-emerald-500/10 text-emerald-500" :
                    "bg-brand-primary/10 text-brand-primary"
                  )}>
                    <Icon size={20} fill={sp.id === 'favorites' ? "currentColor" : "none"} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase italic tracking-tight group-hover:text-white transition-colors">{sp.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{sp.tracks.length} Tracks</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                  <Play size={16} fill="white" className="text-white" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-white/5" />

      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[.3em] ml-2 mt-12 mb-0">Your Playlists</h3>

      {playlists.length === 0 ? (
        <EmptyState 
          icon={ListMusic}
          title="No Playlists"
          description="Group your favorite tracks into custom collections."
          actionLabel="Create Playlist"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={handleCreate}
            className="p-6 rounded-[40px] glass overflow-hidden flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all group border-white/5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl group-hover:rotate-6 transition-all duration-500 relative">
              <div className="absolute inset-0 bg-white/10 rounded-3xl" />
              <Plus size={40} className="text-white relative z-10" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight italic">Create playlist</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">Add to your collection</p>
            </div>
          </div>

          {playlists.map((playlist) => (
            <div key={playlist.id} className="p-6 rounded-[40px] glass overflow-hidden flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all group border-white/10 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center group-hover:rotate-[-6deg] transition-all duration-500 overflow-hidden relative shadow-xl border border-white/10">
                 <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-indigo-500/10" />
                 <ListMusic size={36} className="text-brand-primary relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-xl tracking-tight truncate group-hover:text-brand-primary transition-colors uppercase italic">{playlist.name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{playlist.trackIds.length} tracks</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));
                    if (playlistTracks.length > 0) {
                      playTrack(playlistTracks[0]);
                      setQueue(playlistTracks.slice(1));
                    }
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-black transition-all shadow-lg active:scale-90 group/play"
                >
                  <Play size={20} fill="currentColor" className="group-hover/play:fill-black" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    shufflePlaylist(playlist);
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-90 group/shuffle"
                >
                  <Shuffle size={20} className="group-hover/shuffle:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

