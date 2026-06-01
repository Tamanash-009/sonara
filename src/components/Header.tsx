import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { Search, Music, Command, X, Settings, Smartphone } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const navigate = useNavigate();
  const { tracks, playlists, userName } = useLibrary();
  const { playTrack } = useAudio();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { tracks: [], artists: [], albums: [], playlists: [] };
    
    const q = query.toLowerCase();
    const filteredTracks = tracks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q) || 
      t.album.toLowerCase().includes(q)
    );

    const filteredArtists = Array.from(new Set(tracks.map(t => t.artist)))
      .filter((a: string) => a.toLowerCase().includes(q));

    const filteredAlbums = Array.from(new Set(tracks.map(t => t.album)))
      .filter((a: string) => a.toLowerCase().includes(q));

    const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(q));

    return {
      tracks: filteredTracks.slice(0, 5),
      artists: filteredArtists.slice(0, 3),
      albums: filteredAlbums.slice(0, 3),
      playlists: filteredPlaylists.slice(0, 3)
    };
  }, [query, tracks, playlists]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-[45] flex items-center justify-between px-6 h-20 glass-m border-b border-white/5 backdrop-blur-3xl transition-all duration-500",
      isDesktop ? "bg-transparent border-0" : "glass-m"
    )}>
      <div className="flex items-center gap-8">
        {!isDesktop && (
          <NavLink to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Music size={22} className="text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tightest uppercase italic text-white hidden sm:block">Sonara</h1>
          </NavLink>
        )}
      </div>

      <div className={cn(
        "relative flex-1 max-w-xl transition-all duration-500",
        isDesktop ? "mx-0" : "mx-2 md:mx-8"
      )}>
        <form onSubmit={handleSearch} className="relative group">
          <Search 
            size={18} 
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              isFocused ? "text-brand-primary" : "text-slate-500"
            )} 
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search songs, artists, albums..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-16 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white/10 placeholder:text-slate-600",
              isFocused && "border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.05)]"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10 pointer-events-none">
            <Command size={10} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500">K</span>
          </div>
        </form>

        <AnimatePresence>
          {showResults && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 glass-m rounded-3xl border border-white/10 shadow-3xl p-6 overflow-hidden max-h-[60vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[.3em]">Instant Results</h3>
                <button onClick={() => setShowResults(false)}><X size={14} className="text-slate-500 hover:text-white" /></button>
              </div>

              <div className="space-y-6">
                {results.tracks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-white/20 uppercase tracking-widest pl-2">Songs</h4>
                    {results.tracks.map(track => (
                      <button 
                        key={track.id}
                        onClick={() => {
                          playTrack(track);
                          setShowResults(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {track.cover ? <img src={track.cover} alt="" className="w-full h-full object-cover" /> : <Music size={16} className="m-auto text-white/10" />}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                           <div className="text-xs font-black uppercase italic truncate group-hover:text-brand-primary">{track.title}</div>
                           <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider truncate">{track.artist}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.albums.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-white/20 uppercase tracking-widest pl-2">Albums</h4>
                    <div className="flex flex-wrap gap-2 px-2">
                      {results.albums.map(album => (
                        <button 
                          key={album}
                          onClick={() => {
                            navigate(`/album/${encodeURIComponent(album)}`);
                            setShowResults(false);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all border border-white/5 shadow-sm"
                        >
                          {album}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.artists.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-white/20 uppercase tracking-widest pl-2">Artists</h4>
                    <div className="flex flex-wrap gap-2 px-2">
                      {results.artists.map(artist => (
                        <button 
                          key={artist}
                          onClick={() => {
                            navigate(`/artist/${encodeURIComponent(artist)}`);
                            setShowResults(false);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-brand-primary/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-all border border-white/5"
                        >
                          {artist}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
                  <div className="py-10 text-center space-y-3 opacity-30">
                    <Search size={32} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[.2em]">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <button 
                  onClick={handleSearch}
                  className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                >
                  View all results for "{query}"
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            const event = new CustomEvent('toggle-floating-android-widget');
            window.dispatchEvent(event);
          }}
          title="Toggle Floating Android Widget"
          className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-brand-primary hover:border-brand-primary/30 transition-all active:scale-90"
        >
          <Smartphone size={20} />
        </button>
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
            isActive ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings size={20} />
        </NavLink>
        <button 
          title={userName || 'Voyager'}
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all overflow-hidden p-0.5"
        >
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'Sonara'}`} alt="Avatar" className="w-full h-full rounded-[10px]" />
        </button>
      </div>
    </header>
  );
}

function SearchSection({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[9px] font-black text-white/20 uppercase tracking-widest">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button key={item} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all border border-white/5">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
