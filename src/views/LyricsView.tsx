import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useLibrary } from '../contexts/LibraryContext';
import { cn } from '../lib/utils';
import { Mic2, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function LyricsView() {
  const { currentTrack, progress } = useAudio();
  const { enrichTrackMetadata, isLoading: libraryLoading } = useLibrary();
  const [enriching, setEnriching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentTrack && !currentTrack.syncedLyrics && !libraryLoading) {
      setEnriching(true);
      // We prioritize neural enrichment if enabled, but use LRCLIB context if available
      enrichTrackMetadata(currentTrack.id).finally(() => setEnriching(false));
    }
  }, [currentTrack?.id, libraryLoading, enrichTrackMetadata]);

  const currentTime = (progress / 100) * (currentTrack?.duration || 0);
  const syncedLyrics = currentTrack?.syncedLyrics;
  
  const activeIndex = syncedLyrics?.findIndex((line, index) => {
    return currentTime >= line.time && (index === syncedLyrics.length - 1 || currentTime < syncedLyrics[index + 1].time);
  });

  // Scroll active lyric into view
  useEffect(() => {
    if (containerRef.current && activeIndex !== undefined && activeIndex !== -1) {
      const activeElement = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeIndex]);

  if (!currentTrack) {
    return (
      <EmptyState 
        icon={Music}
        title="No Track Playing"
        description="Play a song to see its lyrics here. Sonara supports synchronized karaoke-style playback."
      />
    );
  }

  if (enriching || libraryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 h-full">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Syncing Lyrics...</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{currentTrack.title}</p>
        </div>
      </div>
    );
  }

  if (!syncedLyrics && !currentTrack.lyrics) {
    return (
      <EmptyState 
        icon={Mic2}
        title="Lyrics unavailable"
        description={`We couldn't find any lyrics for "${currentTrack.title}" by ${currentTrack.artist}.`}
      />
    );
  }

  return (
    <div className="h-full flex flex-col pt-10">
      <header className="flex items-center justify-between px-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tightest uppercase italic leading-none">{currentTrack.title}</h2>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{currentTrack.artist}</p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-lg",
          syncedLyrics ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-white/5 border-white/10 text-slate-500"
        )}>
          {syncedLyrics ? (
            <>
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Synced</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Unsynced Fallback</span>
            </>
          )}
        </div>
      </header>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto no-scrollbar mask-fade-edges"
      >
        <div className="flex flex-col gap-12 px-6 py-[40vh]">
          {syncedLyrics ? (
            syncedLyrics.map((line, index) => {
              const isActive = activeIndex === index;
              return (
                <div 
                  key={index}
                  data-index={index}
                  className={cn(
                    "text-4xl md:text-5xl lg:text-7xl font-black transition-all duration-700 cursor-default uppercase tracking-tightest leading-tight italic",
                    isActive 
                      ? "text-brand-primary active-lyric scale-105 origin-left drop-shadow-[0_10px_20px_rgba(34,211,238,0.2)] opacity-100" 
                      : "text-white/10 scale-95 blur-[1px] opacity-40 hover:opacity-100 hover:blur-0"
                  )}
                >
                  {line.text}
                </div>
              );
            })
          ) : (
            <div className="text-2xl md:text-3xl font-bold text-white/40 leading-relaxed whitespace-pre-wrap uppercase tracking-tight italic">
              {currentTrack.lyrics}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

