import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, SkipBack, X,
  ChevronDown, ChevronUp, Volume2, Volume1, Volume, VolumeX, Shuffle, 
  Repeat, Mic2, ListMusic, MoreHorizontal, Sliders, Music, Timer, Clock
} from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { cn, formatTime, getHashColor } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { FrequencyVisualizer } from './FrequencyVisualizer';

export function NowPlayingSheet() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'player' | 'queue'>('player');
  const [showVolume, setShowVolume] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const volumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { 
    currentTrack, isPlaying, togglePlay, 
    playNext, playPrevious, progress, seek,
    volume, setVolume, repeatMode, setRepeatMode,
    shuffle, setShuffle, queue, moveQueueTrack, removeFromQueue, clearQueue, playTrack,
    isBuffering, playbackError, sleepTimer, setSleepTimer
  } = useAudio();

  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const isMobile = !isDesktop;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player */}
      <motion.div 
        layout
        onClick={() => setIsExpanded(true)}
        className={cn(
          "fixed glass p-3 z-50 cursor-pointer shadow-3xl transition-all border border-white/10 backdrop-blur-3xl group mb-[env(safe-area-inset-bottom)] will-change-transform",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100",
          isDesktop 
            ? "bottom-8 left-[19rem] right-8 rounded-[2rem]" 
            : "bottom-[112px] left-4 right-4 rounded-[2.5rem] md:bottom-28 md:left-6 md:right-6"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary/20 shadow-xl border border-white/10 relative">
            {currentTrack.cover ? (
              <img src={currentTrack.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-white/20"
                style={{ backgroundColor: getHashColor(currentTrack.album || currentTrack.artist) }}
              >
                <Music size={24} />
              </div>
            )}
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex gap-0.5 items-end h-3 px-1 bg-black/40 backdrop-blur-sm rounded-sm">
                <div className="w-0.5 bg-brand-primary animate-[bounce_0.8s_infinite] h-full" />
                <div className="w-0.5 bg-brand-primary animate-[bounce_1s_infinite] h-2/3" />
                <div className="w-0.5 bg-brand-primary animate-[bounce_1.2s_infinite] h-5/6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black truncate tracking-tight mb-0.5 uppercase italic">{currentTrack.title}</h4>
            <p className="text-[10px] text-slate-500 truncate uppercase font-black tracking-widest">{currentTrack.artist}</p>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <div className="hidden md:flex items-center gap-4 mr-6 px-4 border-r border-white/5">
               <button 
                onClick={(e) => { e.stopPropagation(); setShuffle(!shuffle); }} 
                className={cn("p-1 transition-all active:scale-90", shuffle ? "text-brand-primary" : "text-slate-600 hover:text-slate-400")}
                title="Shuffle"
               >
                 <Shuffle size={16} />
               </button>
               <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
                  const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                  setRepeatMode(nextMode);
                }} 
                className={cn("p-1 transition-all active:scale-90 relative", repeatMode !== 'none' ? "text-brand-primary" : "text-slate-600 hover:text-slate-400")}
                title="Repeat Mode"
               >
                 <Repeat size={16} />
                 {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[7px] font-black bg-brand-primary text-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black shadow-sm">1</span>}
               </button>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); playPrevious(); }} 
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="w-12 h-12 bg-brand-primary text-black rounded-2xl flex items-center justify-center shadow-xl transform active:scale-95 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={isBuffering}
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={24} fill="black" />
              ) : (
                <Play size={24} fill="black" className="ml-1" />
              )}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); playNext(); }} 
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-6 right-6 h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </motion.div>

      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%', borderRadius: '40px' }}
            animate={{ y: 0, borderRadius: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#0f141a] z-50 flex flex-col p-8 pb-16 overflow-hidden"
          >
             {/* Background Effects */}
             <div className="absolute inset-0 pointer-events-none opacity-40">
               <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-gradient-to-br from-indigo-900/60 via-transparent to-cyan-900/40 blur-[100px]" />
               <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-brand-primary/10 to-transparent" />
             </div>

             <header className="flex items-center justify-between relative z-10 mb-8">
               <button onClick={() => setIsExpanded(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                 <ChevronDown size={28} />
               </button>
               <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                 <button 
                  onClick={() => setActiveView('player')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeView === 'player' ? "bg-white text-black" : "text-slate-500 hover:text-white"
                  )}
                 >
                   Player
                 </button>
                 <button 
                  onClick={() => setActiveView('queue')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeView === 'queue' ? "bg-white text-black" : "text-slate-500 hover:text-white"
                  )}
                 >
                   Queue ({queue.length})
                 </button>
               </div>
               <button className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all opacity-0 pointer-events-none">
                 <MoreHorizontal size={24} />
               </button>
             </header>

             <div className="flex-1 overflow-hidden relative z-10">
               <AnimatePresence mode="wait">
                 {activeView === 'player' ? (
                   <motion.div 
                    key="player"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-around py-4"
                   >
                     {/* Album Art */}
                     <div className="w-full max-w-[360px] aspect-square rounded-[3.5rem] glass-m shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 transform hover:scale-[1.02] border-white/10 relative group shadow-brand-primary/10">
                        {currentTrack.cover ? (
                          <img src={currentTrack.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white/10 transition-all duration-700"
                            style={{ backgroundColor: getHashColor(currentTrack.album || currentTrack.artist) }}
                          >
                            <Music size={120} className="group-hover:scale-125 transition-transform duration-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                     </div>

                     {/* Track Info */}
                     <div className="w-full text-center space-y-4">
                       <div className="space-y-1">
                         <h2 className="text-4xl font-black tracking-tightest text-white uppercase italic leading-none">{currentTrack.title}</h2>
                         <p className="text-lg text-brand-primary/80 font-black uppercase tracking-[0.2em]">{currentTrack.artist} <span className="text-white/20 mx-2 font-normal">•</span> {currentTrack.album}</p>
                       </div>
                       
                       {playbackError && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full"
                         >
                           <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{playbackError}</span>
                         </motion.div>
                       )}
                       
                       {isBuffering && !playbackError && (
                         <div className="flex items-center justify-center gap-2 text-brand-primary/50">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" />
                           <span className="text-[10px] font-black uppercase tracking-widest ml-1">Buffering Neural Stream...</span>
                         </div>
                       )}
                     </div>

                     {/* Frequency Visualizer */}
                     <div className="w-full max-w-[360px] px-4">
                       <FrequencyVisualizer />
                     </div>

                     {/* Progress Area */}
                     <div className="w-full space-y-4 px-4">
                       <div className="relative h-2 w-full bg-white/5 rounded-full group cursor-pointer border border-white/10 overflow-hidden">
                         <div 
                          className="absolute inset-x-0 h-full bg-brand-primary/10"
                         />
                         <div 
                          className="absolute h-full bg-gradient-to-r from-brand-primary to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                          style={{ width: `${progress}%` }}
                         />
                         <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress}
                            onChange={(e) => seek(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                         />
                       </div>
                       <div className="flex justify-between text-[10px] font-black font-mono text-slate-500 tracking-[0.2em]">
                         <span className={cn(progress > 0 && "text-brand-primary")}>{formatTime((progress / 100) * currentTrack.duration)}</span>
                         <span>{formatTime(currentTrack.duration)}</span>
                       </div>
                     </div>

                     {/* Main Controls */}
                     <div className="w-full flex items-center justify-between px-6">
                       <button 
                        onClick={() => setShuffle(!shuffle)}
                        className={cn("p-2 transition-all transform hover:scale-110", shuffle ? "text-brand-primary drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-white/20")}
                       >
                         <Shuffle size={28} />
                       </button>
                       
                       <div className="flex items-center gap-6 md:gap-10">
                         <button onClick={playPrevious} className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-95">
                           <SkipBack size={isMobile ? 40 : 48} fill="currentColor" />
                         </button>
                         <button 
                          onClick={togglePlay}
                          disabled={isBuffering && !isPlaying}
                          className="w-20 h-20 md:w-24 md:h-24 bg-white text-black rounded-[28px] md:rounded-[32px] flex items-center justify-center shadow-[0_15px_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all hover:bg-brand-primary disabled:opacity-50 disabled:scale-100"
                         >
                           {isBuffering ? (
                             <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                           ) : isPlaying ? (
                             <Pause size={isMobile ? 40 : 48} fill="black" />
                           ) : (
                             <Play size={isMobile ? 40 : 48} fill="black" className="ml-2" />
                           )}
                         </button>
                         <button onClick={playNext} className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-95">
                           <SkipForward size={isMobile ? 40 : 48} fill="currentColor" />
                         </button>
                       </div>

                       <button 
                        onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                        className={cn("p-2 transition-all transform hover:scale-110 relative", repeatMode !== 'none' ? "text-brand-primary drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-white/20")}
                       >
                         <Repeat size={28} />
                         {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black bg-brand-primary text-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">1</span>}
                       </button>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                    key="queue"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="h-full flex flex-col space-y-6"
                   >
                     <div className="flex items-center justify-between px-6 pt-2">
                       <h3 className="text-xl font-black uppercase tracking-tightest italic text-white/90">Next Up</h3>
                       <button 
                        onClick={clearQueue}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-primary transition-all border border-white/5 active:scale-95"
                       >
                         Clear Queue
                       </button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
                        {queue.length > 0 ? (
                          queue.map((track, i) => (
                            <div 
                              key={`${track.id}-${i}`}
                              className="flex items-center gap-4 p-4 glass rounded-[2.5rem] group hover:bg-white/5 border border-white/5 transition-all"
                            >
                               <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                                  {track.cover ? (
                                    <img src={track.cover} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div 
                                      className="w-full h-full flex items-center justify-center text-white/10"
                                      style={{ backgroundColor: getHashColor(track.album || track.artist) }}
                                    >
                                      <Music size={20} />
                                    </div>
                                  )}
                               </div>
                               <div className="flex-1 min-w-0" onClick={() => playTrack(track, true)}>
                                  <h4 className="font-black text-sm uppercase italic truncate">{track.title}</h4>
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{track.artist}</p>
                               </div>
                               <div className="flex items-center gap-1">
                                 <button 
                                  onClick={() => moveQueueTrack(i, Math.max(0, i-1))} 
                                  disabled={i === 0}
                                  className="p-2 text-slate-500 hover:text-white transition-colors disabled:opacity-20"
                                 >
                                   <ChevronUp size={20} />
                                 </button>
                                 <button 
                                  onClick={() => moveQueueTrack(i, Math.min(queue.length-1, i+1))} 
                                  disabled={i === queue.length - 1}
                                  className="p-2 text-slate-500 hover:text-white transition-colors disabled:opacity-20"
                                 >
                                   <ChevronDown size={20} />
                                 </button>
                                 <button onClick={() => removeFromQueue(track.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                   <X size={20} /> 
                                 </button>
                               </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50">
                            <ListMusic size={48} strokeWidth={1} />
                            <p className="text-xs font-black uppercase tracking-widest">Queue is empty</p>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Footer Actions */}
             <footer className="w-full py-6 relative z-10 border-t border-white/5">
                <div className="flex items-center justify-around">
                  <button 
                    onClick={() => {
                      if (activeView === 'queue') setActiveView('player');
                      else setActiveView('queue');
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all group",
                      activeView === 'queue' ? "text-brand-primary" : "text-slate-500 hover:text-white"
                    )}
                  >
                    <ListMusic size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Queue</span>
                  </button>

                   <div className="flex flex-col items-center gap-2 group relative">
                      <AnimatePresence>
                        {showSleepTimer && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full mb-6 p-4 glass rounded-[2.5rem] border border-white/10 flex flex-col gap-2 z-[70] shadow-3xl backdrop-blur-4xl w-40"
                          >
                             <div className="px-2 py-1 mb-1 border-b border-white/5">
                               <p className="text-[9px] font-black uppercase tracking-tighter text-slate-500">Sleep Timer</p>
                             </div>
                             {[5, 15, 30, 45, 60].map((mins) => (
                               <button 
                                 key={mins}
                                 onClick={() => {
                                   setSleepTimer(mins * 60);
                                   setShowSleepTimer(false);
                                 }}
                                 className="px-4 py-2 rounded-xl hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-left transition-all hover:text-brand-primary"
                               >
                                 {mins} Minutes
                               </button>
                             ))}

                             <div className="border-t border-white/5 pt-2 mt-1 flex flex-col gap-1">
                               <p className="text-[8px] px-4 font-black uppercase text-slate-500 tracking-widest text-left mb-1">Custom (Mins)</p>
                               <input 
                                 type="number"
                                 placeholder="Type & Enter"
                                 min="1"
                                 max="1440"
                                 className="mx-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white uppercase font-black text-center focus:outline-none focus:border-brand-primary/50 transition-colors placeholder:text-slate-600"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     const val = parseInt((e.target as HTMLInputElement).value);
                                     if (val > 0) {
                                       setSleepTimer(val * 60);
                                       setShowSleepTimer(false);
                                     }
                                   }
                                 }}
                               />
                             </div>

                             {sleepTimer.remainingSeconds !== null && (
                               <button 
                                 onClick={() => {
                                   setSleepTimer(null);
                                   setShowSleepTimer(false);
                                 }}
                                 className="px-4 py-2 mt-1 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest text-left"
                               >
                                 Cancel Timer
                               </button>
                             )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button 
                        onClick={() => setShowSleepTimer(!showSleepTimer)}
                        className={cn(
                          "transition-all duration-300 transform active:scale-90",
                          sleepTimer.remainingSeconds !== null ? "text-brand-primary" : "text-slate-500 hover:text-white"
                        )}
                      >
                        <Timer size={24} className={cn(sleepTimer.remainingSeconds !== null && "animate-pulse")} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {sleepTimer.remainingSeconds !== null ? formatTime(sleepTimer.remainingSeconds).split(':')[0] + 'm' : 'Sleep'}
                      </span>
                   </div>

                  <button 
                   onClick={() => {
                     setIsExpanded(false);
                     navigate('/lyrics');
                   }}
                   className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-all group"
                  >
                    <Mic2 size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Lyrics</span>
                  </button>
                   <div 
                      className="flex flex-col items-center gap-2 group relative"
                      onMouseEnter={() => !isMobile && setShowVolume(true)}
                      onMouseLeave={() => {
                        if (!isMobile) {
                          volumeTimerRef.current = setTimeout(() => setShowVolume(false), 500);
                        }
                      }}
                   >
                      <AnimatePresence>
                        {showVolume && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full mb-6 p-5 glass rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 h-60 z-[70] shadow-3xl backdrop-blur-4xl"
                            onMouseEnter={() => {
                              if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
                            }}
                            onMouseLeave={() => {
                              if (!isMobile) setShowVolume(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative w-3 h-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                               <motion.div 
                                 className="absolute bottom-0 w-full bg-brand-primary shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                                 style={{ height: `${volume * 100}%` }}
                               />
                               <input 
                                 type="range" 
                                 min="0" 
                                 max="1" 
                                 step="0.01" 
                                 value={volume}
                                 onChange={(e) => setVolume(parseFloat(e.target.value))}
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [appearance:slider-vertical] z-10"
                                 style={{ WebkitAppearance: 'slider-vertical' } as any}
                               />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black font-mono text-brand-primary drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                {Math.round(volume * 100)}%
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMobile) setShowVolume(!showVolume);
                          else if (volume === 0) setVolume(0.5);
                          else setVolume(0);
                        }}
                        className={cn("transition-all duration-300 transform active:scale-90", showVolume || volume > 0 ? "text-brand-primary" : "text-slate-500 hover:text-white")}
                      >
                        {volume === 0 ? <VolumeX size={24} /> : 
                         volume < 0.3 ? <Volume size={24} /> :
                         volume < 0.7 ? <Volume1 size={24} /> : 
                         <Volume2 size={24} />}
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vol</span>
                   </div>
                  <button 
                   onClick={() => {
                     setIsExpanded(false);
                     navigate('/equalizer');
                   }}
                   className="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-all group"
                  >
                    <Sliders size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">EQ</span>
                  </button>
                </div>
             </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
