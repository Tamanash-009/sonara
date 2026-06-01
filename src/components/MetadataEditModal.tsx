import React, { useState, useEffect } from 'react';
import { X, Save, Music, User,Disc, Tag, Calendar, Hash } from 'lucide-react';
import { Track } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MetadataEditModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackId: string, updates: Partial<Track>) => void;
}

export function MetadataEditModal({ track, isOpen, onClose, onSave }: MetadataEditModalProps) {
  const [formData, setFormData] = useState<Partial<Track>>({
    title: track.title,
    artist: track.artist,
    album: track.album,
    genre: track.genre,
    year: track.year,
    trackNumber: track.trackNumber,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        year: track.year,
        trackNumber: track.trackNumber,
      });
    }
  }, [isOpen, track]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(track.id, formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass-m border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-8">
              <header className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Edit Metadata</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Update song details</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                      <Music size={12} className="text-brand-primary" /> Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>

                  {/* Artist */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                      <User size={12} className="text-brand-primary" /> Artist
                    </label>
                    <input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>

                  {/* Album */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                      <Disc size={12} className="text-brand-primary" /> Album
                    </label>
                    <input
                      type="text"
                      value={formData.album}
                      onChange={(e) => setFormData(prev => ({ ...prev, album: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {/* Genre */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                        <Tag size={12} className="text-brand-primary" /> Genre
                      </label>
                      <input
                        type="text"
                        value={formData.genre}
                        onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                      />
                    </div>
                    {/* Year */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                        <Calendar size={12} className="text-brand-primary" /> Year
                      </label>
                      <input
                        type="number"
                        value={formData.year || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Track Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
                      <Hash size={12} className="text-brand-primary" /> Track Number
                    </label>
                    <input
                      type="number"
                      value={formData.trackNumber || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackNumber: parseInt(e.target.value) || undefined }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 rounded-2xl bg-brand-primary text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
