import { useState, useMemo, useEffect } from 'react';
import { Search, Music, Play, X, TrendingUp, Zap, Puzzle, Globe, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { cn, getHashColor } from '../lib/utils';
import { useProviders } from '../contexts/ProviderContext';
import { ExtensionMarketplace } from './ExtensionMarketplace';
import Fuse from 'fuse.js';
import { Track } from '../types';

export function SearchView() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [providerResults, setProviderResults] = useState<Track[]>([]);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const { tracks } = useLibrary();
  const { activeProviders, searchProviders, providerHealth } = useProviders();

  useEffect(() => {
    let isMounted = true;
    const search = async () => {
      if (query.trim().length > 2 && activeProviders.some(p => p.type === 'music')) {
        setIsSearchingOnline(true);
        setSearchErrors([]);
        try {
          const { results, errors } = await searchProviders(query);
          if (isMounted) {
            // Deduplicate online results
            const uniqueResults = results.reduce((acc, curr) => {
              const key = `${curr.title}_${curr.artist}`.toLowerCase();
              if (!acc.find(i => `${i.title}_${i.artist}`.toLowerCase() === key)) {
                acc.push(curr);
              }
              return acc;
            }, [] as Track[]);

            setProviderResults(uniqueResults);
            setSearchErrors(errors);
            setIsSearchingOnline(false);
          }
        } catch (err) {
          if (isMounted) {
            setIsSearchingOnline(false);
            setSearchErrors(['Failed to connect to neural bridge. Please check your connection.']);
          }
        }
      } else {
        setProviderResults([]);
        setSearchErrors([]);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query, activeProviders, searchProviders]);

  const { playTrack, currentTrack } = useAudio();

  const fuse = useMemo(() => {
    return new Fuse(tracks, {
      keys: ['title', 'artist', 'album'],
      threshold: 0.4,
      distance: 100,
      includeScore: true
    });
  }, [tracks]);

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    
    const items = new Set<string>();
    const normalizedQuery = query.toLowerCase().trim();

    // 1. Prioritize Exact Matches
    tracks.forEach(track => {
      if (items.size >= 10) return;
      if (track.title.toLowerCase() === normalizedQuery) items.add(track.title);
      if (track.artist.toLowerCase() === normalizedQuery) items.add(track.artist);
      if (track.album?.toLowerCase() === normalizedQuery) items.add(track.album);
    });

    // 2. Use Fuse.js for partial and ranked matches
    const searchResults = fuse.search(query);
    searchResults.forEach(result => {
      if (items.size >= 10) return;
      const { title, artist, album } = result.item;
      
      // Prioritize suggestions that contain the query
      if (title.toLowerCase().includes(normalizedQuery)) items.add(title);
      if (artist.toLowerCase().includes(normalizedQuery)) items.add(artist);
      if (album?.toLowerCase().includes(normalizedQuery)) items.add(album);
    });
    
    return Array.from(items).slice(0, 5);
  }, [fuse, query, tracks]);

  const results = useMemo(() => {
    if (!query.trim()) return { tracks: [], albums: [], artists: [] };
    const searchResults = fuse.search(query).map(result => result.item);
    
    // Group results
    const artists = new Set<string>();
    const albums = new Set<string>();
    const tracks: Track[] = [];

    searchResults.forEach(track => {
      tracks.push(track);
      artists.add(track.artist);
      albums.add(`${track.album}|${track.artist}`);
    });

    return {
      tracks: tracks.slice(0, 20),
      artists: Array.from(artists).slice(0, 5),
      albums: Array.from(albums).map(a => {
        const [album, artist] = a.split('|');
        return { album, artist };
      }).slice(0, 5)
    };
  }, [fuse, query]);

  if (showMarketplace) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setShowMarketplace(false)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors ml-4"
        >
          <X size={12} />
          Back to Search
        </button>
        <ExtensionMarketplace />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up pb-24 px-2">
      <div className="relative z-50 max-w-2xl mx-auto flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search size={22} className="text-brand-primary/50" />
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search songs, artists, or albums..."
            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-6 pl-16 pr-16 text-lg font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all placeholder:text-slate-600 focus:bg-white/10 shadow-2xl backdrop-blur-xl"
          />
          {query && (
            <button 
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
              }}
              className="absolute inset-y-0 right-6 flex items-center text-slate-500 hover:text-white transition-colors p-2"
            >
              <X size={22} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setShowMarketplace(true)}
          className={cn(
            "p-6 bg-white/5 border border-white/10 rounded-[2rem] text-slate-500 hover:text-brand-primary hover:bg-white/10 transition-all shadow-xl relative group",
            activeProviders.length > 0 && "text-brand-primary/80"
          )}
        >
          <Puzzle size={24} className="group-hover:rotate-12 transition-transform" />
          {activeProviders.length > 0 && (
            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          )}
        </button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-4 glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-slide-up backdrop-blur-3xl">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full px-8 py-5 flex items-center gap-4 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0 group"
              >
                <Search size={16} className="text-brand-primary/50 group-hover:text-brand-primary transition-colors" />
                <span className="font-bold text-slate-200 uppercase tracking-widest text-[10px] sm:text-xs">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-12 relative z-10" onClick={() => setShowSuggestions(false)}>
        {query && results.tracks.length === 0 && (
          <div className="py-24 text-center glass rounded-[3rem] border border-white/5 shadow-2xl">
             <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-white/5 border border-white/5">
                <Search size={32} />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No matching results found</p>
          </div>
        )}

        {query && (results.artists.length > 0 || results.albums.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.artists.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] px-6">Top Artists</h3>
                <div className="space-y-2">
                  {results.artists.map(artist => (
                    <div 
                      key={artist}
                      onClick={() => setQuery(artist)}
                      className="flex items-center gap-4 p-4 glass rounded-3xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black uppercase italic shadow-lg">
                        {artist.charAt(0)}
                      </div>
                      <span className="font-bold uppercase italic tracking-tight">{artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.albums.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] px-6">Top Albums</h3>
                <div className="space-y-2">
                  {results.albums.map(({ album, artist }) => (
                    <div 
                      key={`${album}-${artist}`}
                      onClick={() => setQuery(album)}
                      className="flex items-center gap-4 p-4 glass rounded-3xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 shadow-lg" style={{ background: getHashColor(album) }}>
                        <Music size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold uppercase italic tracking-tight truncate">{album}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {searchErrors.length > 0 && (
          <div className="mx-6 p-4 glass-m border border-rose-500/20 rounded-2xl bg-rose-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                {searchErrors[0]}
              </p>
            </div>
            <button 
              onClick={() => {
                setQuery(query + ' '); // Trigger re-search
                setTimeout(() => setQuery(query.trim()), 0);
              }}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-500/20"
            >
              Retry Discovery
            </button>
          </div>
        )}

        {isSearchingOnline && providerResults.length === 0 && (
          <div className="space-y-4 pt-4 px-6">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 bg-brand-primary/20 rounded-full" />
              <div className="w-32 h-3 bg-brand-primary/20 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-[2rem] bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer" />
                  <div className="w-12 h-12 rounded-2xl bg-white/10 shrink-0 relative z-10" />
                  <div className="flex-1 space-y-2 relative z-10">
                    <div className="w-3/4 h-3 bg-white/10 rounded-full" />
                    <div className="w-1/2 h-2 bg-white/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSearchingOnline && providerResults.length > 0 && (
          <div className="flex items-center justify-center gap-3 py-4 animate-pulse">
            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary italic">Updating Results...</span>
          </div>
        )}

        {providerResults.length > 0 && (
          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between px-6">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] flex items-center gap-2">
                  <Globe size={14} />
                  Neural Bridge Results
                </h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerResults.map((track) => (
                  <SearchResultItem key={track.id} track={track} isOnline />
                ))}
             </div>
          </div>
        )}

        {results.tracks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] px-6 text-center sm:text-left">Local Library Matching</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.tracks.map((track) => (
                <SearchResultItem key={track.id} track={track} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultItem({ track, isOnline = false }: { key?: string; track: Track; isOnline?: boolean }) {
  const { playTrack, currentTrack } = useAudio();
  
  return (
    <div
      onClick={() => playTrack(track)}
      className={cn(
        "flex items-center gap-4 p-3 rounded-[1.5rem] cursor-pointer transition-all group border border-transparent backdrop-blur-sm relative overflow-hidden",
        currentTrack?.id === track.id 
          ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
          : "bg-white/5 hover:bg-white/10 hover:border-white/10"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden relative shadow-lg border border-white/5">
        {track.cover ? (
          <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white/10"
            style={{ backgroundColor: getHashColor(track.album || track.artist) }}
          >
            <Music size={20} className="group-hover:scale-110 transition-transform" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
          <Play size={20} fill="currentColor" className="text-brand-primary translate-x-0.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-black truncate text-sm tracking-tight uppercase italic leading-none",
            currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
          )}>{track.title}</h3>
          {isOnline && (
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-[9px] font-black text-slate-500 truncate uppercase tracking-widest leading-none">{track.artist}</p>
          <span className="text-[8px] text-white/10 font-bold">/</span>
          <p className="text-[9px] font-black text-slate-600 truncate uppercase tracking-widest leading-none">{track.album}</p>
        </div>
      </div>
      {isOnline && (
        <div className="absolute top-0 right-0 p-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
           <Globe size={10} className="text-brand-primary" />
        </div>
      )}
    </div>
  );
}

function CategoryCard({ title, color, iconColor }: { title: string, color: string, iconColor: string }) {
  return (
    <div className="h-36 glass rounded-[2.5rem] p-6 flex flex-col justify-end gap-2 group cursor-pointer hover:bg-white/10 transition-all border border-white/5 relative overflow-hidden shadow-xl">
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700", iconColor)} />
      <h4 className="font-black text-lg tracking-tight uppercase italic z-10 leading-none">{title}</h4>
      <div className={cn("w-10 h-1.5 rounded-full z-10 bg-gradient-to-r to-transparent", color)} />
    </div>
  );
}
