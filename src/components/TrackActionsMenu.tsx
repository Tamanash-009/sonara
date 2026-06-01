import { 
  Play, ListMusic, Plus, HardDrive, 
  Trash2, User, Music as MusicIcon, Info, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';
import { useAudio } from '../contexts/AudioContext';
import { useLibrary } from '../contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface TrackActionsMenuProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number, y: number };
}

export function TrackActionsMenu({ track, isOpen, onClose, position }: TrackActionsMenuProps) {
  const { playTrack, addToQueue, setQueue, queue } = useAudio();
  const { playlists, addToPlaylist, updateTrackMetadata } = useLibrary();
  const navigate = useNavigate();
  const [showPlaylists, setShowPlaylists] = useState(false);

  if (!isOpen) return null;

  const handlePlayNext = () => {
    const newQueue = [track, ...queue];
    setQueue(newQueue);
    onClose();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          style={{ 
            left: Math.min(position.x, window.innerWidth - 240), 
            top: Math.min(position.y, window.innerHeight - 400) 
          }}
          className="absolute w-56 glass-m rounded-3xl border border-white/10 shadow-3xl p-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-white/5 mb-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate italic">{track.title}</h4>
          </div>

          <div className="space-y-1">
            <MenuButton icon={Play} onClick={() => { playTrack(track); onClose(); }} label="Play Now" />
            <MenuButton icon={SkipForwardRotate} onClick={handlePlayNext} label="Play Next" />
            <MenuButton icon={ListMusic} onClick={handleAddToQueue} label="Add to Queue" />
            
            <div className="relative">
              <button 
                onMouseEnter={() => setShowPlaylists(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-slate-300 hover:text-white group"
              >
                <div className="flex items-center gap-3">
                  <Plus size={18} className="text-slate-500 group-hover:text-brand-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add to Playlist</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>

              {showPlaylists && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full top-0 ml-2 w-48 glass-m rounded-2xl border border-white/10 shadow-2xl p-1 z-50"
                  onMouseLeave={() => setShowPlaylists(false)}
                >
                  {playlists.length > 0 ? (
                    playlists.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { addToPlaylist(p.id, track.id); onClose(); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-primary hover:text-black transition-all text-[10px] font-black uppercase tracking-widest truncate"
                      >
                        {p.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-[9px] font-black uppercase tracking-widest text-slate-600">No Playlists</div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="h-px bg-white/5 my-2 mx-2" />

            <MenuButton icon={MusicIcon} onClick={() => { navigate(`/album/${encodeURIComponent(track.album)}`); onClose(); }} label="Go to Album" />
            <MenuButton icon={User} onClick={() => { navigate(`/artist/${encodeURIComponent(track.artist)}`); onClose(); }} label="Go to Artist" />
            <MenuButton icon={Info} onClick={() => onClose()} label="File Info" />

            <div className="h-px bg-white/5 my-2 mx-2" />
            
            <MenuButton icon={Trash2} onClick={() => onClose()} label="Remove" variant="danger" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MenuButton({ icon: Icon, onClick, label, variant = 'default' }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
        variant === 'danger' ? "hover:bg-red-500/10 text-red-400" : "hover:bg-white/5 text-slate-300 hover:text-white"
      )}
    >
      <Icon size={18} className={cn(
        "transition-colors",
        variant === 'danger' ? "text-red-400" : "text-slate-500 group-hover:text-brand-primary"
      )} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SkipForwardRotate({ size, className }: any) {
  return (
    <div className={cn("relative", className)}>
      <Play size={size - 4} className="ml-0.5" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
    </div>
  );
}
