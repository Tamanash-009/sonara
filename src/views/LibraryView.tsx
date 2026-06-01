import { useState, useMemo, useRef, useEffect } from 'react';
import { Play, MoreVertical, Music, Edit2, Shuffle, ListMusic, ChevronLeft, Tag, ArrowRight, FolderPlus, FilePlus, Check, Trash2, ListPlus, Heart, Clock, RotateCcw, Sliders, Search, X } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { cn, formatTime, isMobile, getHashColor } from '../lib/utils';
import { MetadataEditModal } from '../components/MetadataEditModal';
import { EmptyState } from '../components/EmptyState';
import { TrackActionsMenu } from '../components/TrackActionsMenu';
import { Track, Playlist } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'recent' | 'songs' | 'albums' | 'artists' | 'playlists' | 'genres';

export function LibraryView() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('songs');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') as Tab;
    if (tab && ['recent', 'songs', 'albums', 'artists', 'playlists', 'genres'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [menuTrack, setMenuTrack] = useState<Track | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [swipedTrackId, setSwipedTrackId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterArtist, setFilterArtist] = useState<string>('All');
  const [filterAlbum, setFilterAlbum] = useState<string>('All');
  const [filterGenre, setFilterGenre] = useState<string>('All');
  const [filterDuration, setFilterDuration] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'date'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { tracks, updateTrackMetadata, playlists, smartPlaylists, scanDirectory, scanFiles, deleteTracks, addToPlaylist, toggleFavorite } = useLibrary();
  const { playTrack, currentTrack, setQueue, setShuffle, addToQueue } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isMobileDevice = isMobile();

  const handleImport = () => {
    if (isMobileDevice) {
      fileInputRef.current?.click();
    } else {
      scanDirectory();
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'songs', label: 'Songs' },
    { id: 'recent', label: 'Recent' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'genres', label: 'Genres' },
  ];

  const recentlyAddedTracks = useMemo(() => {
    return smartPlaylists.find(p => p.id === 'recently-added')?.tracks.slice(0, 30) || [];
  }, [smartPlaylists]);

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    tracks.forEach(track => {
      if (track.genre) genreSet.add(track.genre);
    });
    return Array.from(genreSet).sort();
  }, [tracks]);

  const artists = useMemo(() => {
    const artistSet = new Set<string>();
    tracks.forEach(track => {
      if (track.artist) artistSet.add(track.artist);
    });
    return Array.from(artistSet).sort();
  }, [tracks]);

  const albums = useMemo(() => {
    const albumSet = new Set<string>();
    tracks.forEach(track => {
      if (track.album) albumSet.add(track.album);
    });
    return Array.from(albumSet).sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    let result = tracks.filter(track => {
      const artistMatch = filterArtist === 'All' || track.artist === filterArtist;
      const albumMatch = filterAlbum === 'All' || track.album === filterAlbum;
      const genreMatch = filterGenre === 'All' || track.genre === filterGenre;
      
      let durationMatch = true;
      if (filterDuration === 'Short') durationMatch = track.duration < 180;
      else if (filterDuration === 'Medium') durationMatch = track.duration >= 180 && track.duration <= 300;
      else if (filterDuration === 'Long') durationMatch = track.duration > 300;

      const searchMatch = !searchQuery.trim() || 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase());

      return artistMatch && albumMatch && genreMatch && durationMatch && searchMatch;
    });

    // Sort result
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') comparison = a.artist.localeCompare(b.artist);
      else if (sortBy === 'date') comparison = (a.addedAt || 0) - (b.addedAt || 0);

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tracks, filterArtist, filterAlbum, filterGenre, filterDuration, searchQuery, sortBy, sortOrder]);

  const shufflePlaylist = (playlist: Playlist) => {
    const playlistTracks = tracks.filter(t => playlist.trackIds.includes(t.id));
    if (playlistTracks.length === 0) return;

    // Shuffle tracks
    const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
    
    // Play the first one and set the rest as queue
    playTrack(shuffled[0]);
    setQueue(shuffled.slice(1));
    setShuffle(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkQueue = () => {
    const selectedTracks = tracks.filter(t => selectedIds.includes(t.id));
    selectedTracks.forEach(t => addToQueue(t));
    setIsMultiSelect(false);
    setSelectedIds([]);
  };

  const handleBulkFavorite = () => {
    selectedIds.forEach(id => {
      const track = tracks.find(t => t.id === id);
      if (track && !track.isFavorite) toggleFavorite(id);
    });
    setIsMultiSelect(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} tracks?`)) {
      deleteTracks(selectedIds);
      setIsMultiSelect(false);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-24 relative">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1.5 glass-m rounded-2xl w-full sm:w-fit border border-white/10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedGenre(null);
              }}
              className={cn(
                "px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all uppercase whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                  : "text-slate-400 hover:text-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'songs' && tracks.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Local Search Input */}
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Find in library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all placeholder:text-slate-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                  isFiltersOpen || filterArtist !== 'All' || filterAlbum !== 'All' || filterGenre !== 'All' || filterDuration !== 'All'
                    ? "bg-brand-primary text-black border-brand-primary shadow-lg" 
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                )}
              >
                <Sliders size={14} />
                {isFiltersOpen ? 'Hide' : 'Options'}
                {(filterArtist !== 'All' || filterAlbum !== 'All' || filterGenre !== 'All' || filterDuration !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-black/50" />
                )}
              </button>
              <button 
                onClick={() => setIsMultiSelect(!isMultiSelect)}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  isMultiSelect ? "bg-brand-primary text-black border-brand-primary shadow-lg" : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                )}
              >
                {isMultiSelect ? 'Cancel' : 'Select'}
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeTab === 'songs' && isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-m border border-white/5 rounded-[2.5rem] p-6 space-y-6 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Sort By</label>
                  <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                    {(['title', 'artist'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          if (sortBy === option) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          else setSortBy(option);
                        }}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          sortBy === option ? "bg-brand-primary text-black" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {option} {sortBy === option && (sortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Genre</label>
                  <select 
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="All">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Duration</label>
                  <select 
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="All">All Times</option>
                    <option value="Short">Short (&lt; 3m)</option>
                    <option value="Medium">Medium (3-5m)</option>
                    <option value="Long">Long (&gt; 5m)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Reset</label>
                  <button 
                    onClick={() => {
                      setFilterArtist('All');
                      setFilterAlbum('All');
                      setFilterGenre('All');
                      setFilterDuration('All');
                      setSearchQuery('');
                      setSortBy('title');
                      setSortOrder('asc');
                    }}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {activeTab === 'recent' && (
          recentlyAddedTracks.length > 0 ? (
            recentlyAddedTracks.map((track) => (
              <div key={track.id} className="relative group overflow-hidden rounded-[2rem]">
                {/* Delete revealed background */}
                <div 
                  className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center z-0 rounded-[2rem]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrackToDelete(track);
                      setSwipedTrackId(null);
                    }}
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <motion.div 
                  drag="x"
                  dragDirectionLock
                  dragConstraints={{ left: -96, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) {
                      setSwipedTrackId(track.id);
                    } else {
                      setSwipedTrackId(null);
                    }
                  }}
                  animate={{ x: swipedTrackId === track.id ? -96 : 0 }}
                  onClick={() => {
                    if (swipedTrackId === track.id) {
                      setSwipedTrackId(null);
                    } else {
                      isMultiSelect ? toggleSelect(track.id) : playTrack(track);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-5 p-3 sm:p-4 rounded-[2rem] cursor-pointer transition-all group border border-transparent relative z-10 bg-[#0c0c0c]",
                    currentTrack?.id === track.id ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "hover:bg-white/5",
                    isMultiSelect && selectedIds.includes(track.id) ? "bg-white/10 border-white/20" : ""
                  )}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative shadow-lg border border-white/5">
                    {track.cover ? (
                      <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white/10"
                        style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                      >
                        <Music size={24} />
                      </div>
                    )}
                    {currentTrack?.id === track.id && (
                      <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                         <div className="flex gap-0.5 items-end h-5">
                           <div className="w-1.5 bg-black animate-[bounce_0.8s_infinite] h-full rounded-full" />
                           <div className="w-1.5 bg-black animate-[bounce_1s_infinite] h-2/3 rounded-full" />
                           <div className="w-1.5 bg-black animate-[bounce_1.2s_infinite] h-5/6 rounded-full" />
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-black truncate text-lg tracking-tight uppercase italic",
                      currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                    )}>{track.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-black text-slate-500 truncate uppercase tracking-widest leading-none">
                        {track.artist}
                      </p>
                      <span className="text-[8px] text-white/10">•</span>
                      <p className="text-[10px] font-black text-slate-600 truncate uppercase tracking-widest leading-none">
                        {track.album}
                      </p>
                    </div>
                    <p className="text-[8px] text-brand-primary/30 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1">
                      <Clock size={8} />
                      Added {new Date(track.addedAt).toLocaleDateString()}
                    </p>
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
                </motion.div>
              </div>
            ))
          ) : (
            <EmptyState 
              icon={Clock}
              title="No recent songs"
              description="Songs you add to your library will appear here."
              actionLabel={isMobileDevice ? "Import Files" : "Scan Directory"}
              onAction={handleImport}
            />
          )
        )}

        {activeTab === 'songs' && (
          filteredTracks.length > 0 ? (
            filteredTracks.map((track) => (
              <div key={track.id} className="relative group overflow-hidden rounded-[2rem]">
                {/* Delete revealed background */}
                <div 
                  className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center z-0 rounded-[2rem]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrackToDelete(track);
                      setSwipedTrackId(null);
                    }}
                    className="w-full h-full flex items-center justify-center text-white"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <motion.div 
                  drag="x"
                  dragDirectionLock
                  dragConstraints={{ left: -96, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) {
                      setSwipedTrackId(track.id);
                    } else {
                      setSwipedTrackId(null);
                    }
                  }}
                  animate={{ x: swipedTrackId === track.id ? -96 : 0 }}
                  onClick={() => {
                    if (swipedTrackId === track.id) {
                      setSwipedTrackId(null);
                    } else {
                      isMultiSelect ? toggleSelect(track.id) : playTrack(track);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-5 p-3 sm:p-4 rounded-[2rem] cursor-pointer transition-all group border border-transparent relative z-10 bg-[#0c0c0c]",
                    currentTrack?.id === track.id ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "hover:bg-white/5",
                    isMultiSelect && selectedIds.includes(track.id) ? "bg-white/10 border-white/20" : ""
                  )}
                >
                  {isMultiSelect ? (
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0",
                      selectedIds.includes(track.id) ? "bg-brand-primary border-brand-primary text-black" : "border-white/10"
                    )}>
                      {selectedIds.includes(track.id) && <Check size={14} strokeWidth={4} />}
                    </div>
                  ) : (
                    <div className="w-6 flex-shrink-0 text-center font-mono text-[10px] font-black text-slate-600 group-hover:text-brand-primary transition-colors">
                      {track.trackNumber || '—'}
                    </div>
                  )}
                  
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative shadow-lg border border-white/5">
                    {track.cover ? (
                      <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white/10"
                        style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                      >
                        <Music size={24} />
                      </div>
                    )}
                    {currentTrack?.id === track.id && (
                      <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                         <div className="flex gap-0.5 items-end h-5">
                           <div className="w-1.5 bg-black animate-[bounce_0.8s_infinite] h-full rounded-full" />
                           <div className="w-1.5 bg-black animate-[bounce_1s_infinite] h-2/3 rounded-full" />
                           <div className="w-1.5 bg-black animate-[bounce_1.2s_infinite] h-5/6 rounded-full" />
                         </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-black truncate text-lg tracking-tight uppercase italic",
                      currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                    )}>{track.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-slate-400 truncate uppercase tracking-widest">{track.artist}</span>
                      <span className="text-[10px] font-black text-slate-700">/</span>
                      <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-widest">{track.album}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
                      {formatTime(track.duration)}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTrack(track);
                      }}
                      className="p-2 text-slate-500 hover:text-white transition-colors group/edit"
                    >
                      <Edit2 size={18} className="group-hover/edit:scale-110 transition-transform" />
                    </button>
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
                </motion.div>
              </div>
            ))
          ) : tracks.length > 0 ? (
            <EmptyState 
              icon={Sliders}
              title="No matches found"
              description="No songs match your current filter criteria. Try adjusting your filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setFilterArtist('All');
                setFilterAlbum('All');
                setFilterGenre('All');
              }}
            />
          ) : (
            <EmptyState 
              icon={Music}
              title="No songs found"
              description={isMobileDevice 
                ? "Your library is looking a bit quiet. Import music files from your device to get started."
                : "Your library is looking a bit quiet. Import some local music to get started."}
              actionLabel={isMobileDevice ? "Import Files" : "Scan Directory"}
              onAction={handleImport}
            />
          )
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept="audio/*" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files) scanFiles(e.target.files);
          }}
        />

        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-4">
            {Array.from(new Set(tracks.map(t => t.album))).map(albumName => {
              const albumTracks = tracks.filter(t => t.album === albumName);
              const firstTrack = albumTracks[0];
              return (
                <div 
                  key={albumName as string} 
                  onClick={() => navigate(`/album/${encodeURIComponent(albumName as string)}`)}
                  className="space-y-4 group cursor-pointer"
                >
                  <div className="aspect-square rounded-[2.5rem] glass overflow-hidden relative shadow-2xl transition-all duration-500 transform group-hover:scale-[1.05] group-hover:shadow-brand-primary/20">
                    {firstTrack?.cover ? (
                      <img src={firstTrack.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white/5 group-hover:text-white/10 transition-all duration-700"
                        style={{ backgroundColor: getHashColor(albumName as string) }}
                      >
                        <Music size={64} className="group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-all">
                        <ArrowRight size={32} className="text-black" />
                      </div>
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-black text-lg tracking-tight truncate group-hover:text-brand-primary transition-colors uppercase italic">{albumName as string || 'Unknown Album'}</h3>
                    <p className="text-[10px] font-black text-slate-500 truncate uppercase tracking-widest leading-none mt-1">{firstTrack?.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(tracks.map(t => t.artist))).map(artistName => {
              const artistTracks = tracks.filter(t => t.artist === artistName);
              return (
                <div 
                  key={artistName as string} 
                  onClick={() => navigate(`/artist/${encodeURIComponent(artistName as string)}`)}
                  className="flex items-center gap-5 p-5 glass-m rounded-[32px] hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-white/10 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all" />
                  
                  <div 
                    className="w-20 h-20 rounded-full glass flex items-center justify-center text-brand-primary font-black text-3xl shadow-xl group-hover:rotate-6 transition-transform relative overflow-hidden flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${getHashColor(artistName as string)}, #0f172a)` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {(artistName as string || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl tracking-tight group-hover:text-brand-primary transition-colors truncate uppercase italic">{artistName as string || 'Unknown Artist'}</h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{artistTracks.length} tracks</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-black shadow-lg">
                    <ArrowRight size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="p-6 rounded-[40px] glass overflow-hidden flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all group border-white/10 shadow-2xl relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center group-hover:rotate-[-6deg] transition-all duration-500 overflow-hidden relative shadow-xl border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-indigo-500/10" />
                    <ListMusic size={36} className="text-brand-primary relative z-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl tracking-tight truncate group-hover:text-brand-primary transition-colors uppercase italic">{playlist.name}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{playlist.trackIds.length} tracks</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-black shadow-lg">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  icon={ListMusic}
                  title="No Playlists"
                  description="Organize your music into custom collections for any mood."
                  actionLabel="Create Playlist"
                  onAction={() => {
                    const name = prompt('Playlist name:');
                    if (name) useLibrary().createPlaylist(name);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="space-y-6 pt-4">
            {selectedGenre ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <header className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedGenre(null)}
                      className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedGenre}</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {tracks.filter(t => t.genre === selectedGenre).length} tracks found
                      </p>
                    </div>
                  </header>
                  <button
                    onClick={() => {
                      const genreTracks = tracks.filter(t => t.genre === selectedGenre);
                      if (genreTracks.length > 0) {
                        const shuffled = [...genreTracks].sort(() => Math.random() - 0.5);
                        playTrack(shuffled[0]);
                        setQueue(shuffled.slice(1));
                        setShuffle(true);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all w-full sm:w-auto"
                  >
                    <Shuffle size={16} /> Shuffle Genre
                  </button>
                </div>

                <div className="space-y-2">
                  {tracks.filter(t => t.genre === selectedGenre).map(track => (
                    <div 
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={cn(
                        "flex items-center gap-5 p-4 rounded-3xl cursor-pointer transition-all group hover:bg-white/5 border border-transparent",
                        currentTrack?.id === track.id ? "bg-brand-primary/10 border-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : ""
                      )}
                    >
                      <div className="w-6 flex-shrink-0 text-center font-mono text-[10px] font-black text-slate-600 group-hover:text-brand-primary transition-colors">
                        {track.trackNumber || '—'}
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative shadow-lg border border-white/5">
                        {track.cover ? (
                          <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white/10"
                            style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                          >
                            <Music size={24} />
                          </div>
                        )}
                        {currentTrack?.id === track.id && (
                          <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex gap-0.5 items-end h-5">
                              <div className="w-1.5 bg-black animate-[bounce_0.8s_infinite] h-full rounded-full" />
                              <div className="w-1.5 bg-black animate-[bounce_1s_infinite] h-2/3 rounded-full" />
                              <div className="w-1.5 bg-black animate-[bounce_1.2s_infinite] h-5/6 rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-bold truncate text-lg tracking-tight",
                          currentTrack?.id === track.id ? "text-brand-primary" : "text-white"
                        )}>{track.title}</h3>
                        <p className="text-xs font-semibold text-slate-400 truncate uppercase tracking-widest">
                          {track.artist} <span className="mx-1 opacity-30">•</span> {track.album}
                        </p>
                      </div>
                      <div className="text-xs font-bold text-slate-500 px-3 font-mono bg-white/5 py-1 rounded-lg">
                        {formatTime(track.duration)}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTrack(track);
                        }}
                        className="p-2 text-slate-500 hover:text-white transition-colors group/edit"
                      >
                        <Edit2 size={18} className="group-hover/edit:scale-110 transition-transform" />
                      </button>
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {genres.length > 0 ? (
                  genres.map(genre => (
                    <div 
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className="p-8 rounded-[40px] glass-m hover:bg-white/10 cursor-pointer transition-all border border-white/5 group flex items-center justify-between relative overflow-hidden shadow-2xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all pointer-events-none" />
                      
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center group-hover:rotate-6 transition-all border border-brand-primary/20">
                          <Tag size={28} className="text-brand-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-2xl tracking-tight group-hover:text-brand-primary transition-colors">{genre}</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {tracks.filter(t => t.genre === genre).length} tracks
                          </p>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary hover:text-black shadow-lg">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                      icon={Tag}
                      title="No Genres"
                      description="Add some music to see your library categorized by genre."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isMultiSelect && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[var(--safe-area-bottom)] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-lg h-20 glass rounded-[32px] border border-brand-primary/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] z-[60] flex items-center justify-between px-8"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Selected</span>
            <span className="text-lg font-black italic tracking-tighter text-white uppercase">{selectedIds.length} Tracks</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBulkQueue}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/10"
              title="Add to Queue"
            >
              <ListPlus size={20} />
            </button>
            <button 
              onClick={handleBulkFavorite}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/10"
              title="Favorite"
            >
              <Heart size={20} />
            </button>
            <button 
              onClick={handleBulkDelete}
              className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all border border-red-500/10 hover:border-red-500/20"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {editingTrack && (
        <MetadataEditModal
          track={editingTrack}
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          onSave={updateTrackMetadata}
        />
      )}

      {menuTrack && (
        <TrackActionsMenu 
          track={menuTrack}
          isOpen={!!menuTrack}
          onClose={() => setMenuTrack(null)}
          position={menuPosition}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {trackToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm glass-m border border-white/10 rounded-[40px] overflow-hidden shadow-2xl p-8 text-center space-y-6"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-2">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight uppercase italic">Delete Track?</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Are you sure you want to delete <span className="text-white font-bold">"{trackToDelete.title}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setTrackToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5 transition-all text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteTracks([trackToDelete.id]);
                    setTrackToDelete(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
