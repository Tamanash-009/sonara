import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, SkipForward, SkipBack, X, Move, Smartphone, Music, Check, Settings, ToggleLeft, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AndroidWidgetSimulatorProps {
  floating?: boolean;
  onClose?: () => void;
}

export function AndroidWidgetSimulator({ floating = false, onClose }: AndroidWidgetSimulatorProps) {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, progress, seek, volume, setVolume } = useAudio();
  const [accentColor, setAccentColor] = useState('rgba(34, 211, 238, 0.4)');
  const [bgColor, setBgColor] = useState('rgba(30, 41, 59, 0.7)');

  // Extract a responsive Material You style dominant color approximation based on title/artist hashes
  useEffect(() => {
    if (!currentTrack) {
      setAccentColor('rgba(34, 211, 238, 0.4)');
      setBgColor('rgba(20, 24, 30, 0.75)');
      return;
    }

    // Dynamic hash to generate pretty Material You organic pastel palettes
    const hashStr = (currentTrack.title + currentTrack.artist).toLowerCase();
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
      hash = hashStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;

    // Soft Material You translucent tints
    setAccentColor(`hsla(${hue1}, 85%, 65%, 0.45)`);
    setBgColor(`hsla(${hue2}, 30%, 12%, 0.82)`);
  }, [currentTrack?.title, currentTrack?.artist]);

  // Mock standard launcher time
  const [currentTime, setCurrentTime] = useState('12:00');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const defaultTrack = {
    title: 'Sonara Stream',
    artist: 'Hifi Neural Engine',
    album: 'Atmosphere',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300',
  };

  const track = currentTrack || defaultTrack;

  // Widget body
  const widgetContent = (
    <div 
      className="w-full h-full p-4 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden select-none border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] group"
      style={{
        background: `linear-gradient(135deg, ${bgColor}, rgba(15, 23, 42, 0.95))`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Background Album Aura */}
      <div 
        className="absolute inset-0 opacity-[0.22] blur-3xl rounded-full scale-110 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 75%)`,
        }}
      />

      {/* Top Deck Info */}
      <div className="flex gap-4 items-center relative z-10">
        {/* Rounded Android Symmetrical Album Cover */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 relative group/cover border border-white/5">
          <img 
            src={track.cover} 
            alt="" 
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isPlaying && "animate-[spin_12s_linear_infinite]"
            )} 
          />
          {isPlaying && (
            <div className="absolute inset-2 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[1px]">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
            </div>
          )}
        </div>

        {/* Title, Artist with scrolling overflow simulation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[7.5px] font-black uppercase text-brand-primary tracking-widest bg-brand-primary/10 px-1.5 py-0.5 rounded-md leading-none">
              Android Widget
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-[7.5px] font-bold text-slate-400 capitalize truncate">
              {currentTrack ? 'Active Neural Link' : 'Standby Mode'}
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-white truncate leading-snug tracking-tight">
            {track.title}
          </h4>
          <p className="text-[10px] text-slate-300 font-bold truncate tracking-wide">
            {track.artist}
          </p>
        </div>

        {floating && onClose && (
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center text-slate-400 hover:text-white border border-white/5 transition-all self-start active:scale-90"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Playback Progress Loop Area */}
      <div className="w-full space-y-2 mt-4 relative z-10 px-1">
        <div className="flex items-center gap-3">
          {/* Animated Sine-Wave Progress track mimicking premium Android 13 visual styles (flowing ripple state) */}
          <div className="relative h-1 w-full bg-white/10 rounded-full cursor-pointer group/progress overflow-hidden">
            <div 
              className="absolute h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(to right, ${accentColor.replace('0.45', '1')}, #22d3ee)`
              }}
            />
            <input 
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Android Wave Loop in text form inside card footer */}
        <div className="flex justify-between items-center text-[8px] font-black font-mono text-slate-400/90 tracking-widest">
          <span>WIDGET LINKED</span>
          <span className="text-brand-primary animate-pulse">{isNaN(progress) ? '0%' : `${Math.round(progress)}%`}</span>
        </div>
      </div>

      {/* Control Buttons with Android 13 Organic Placement */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-1 relative z-10">
        <button 
          onClick={playPrevious}
          className="p-2.5 rounded-full hover:bg-white/5 active:scale-90 text-white/75 hover:text-white transition-all transform hover:scale-110"
        >
          <SkipBack size={18} fill="currentColor" />
        </button>

        {/* Concentric Playback Accent Bubble */}
        <button 
          onClick={togglePlay}
          className="w-12 h-12 rounded-[22px] flex items-center justify-center transition-all transform active:scale-95 shadow-md border"
          style={{
            backgroundColor: accentColor.replace('0.45', '0.22'),
            borderColor: accentColor,
            color: '#ffffff',
          }}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
        </button>

        <button 
          onClick={playNext}
          className="p-2.5 rounded-full hover:bg-white/5 active:scale-90 text-white/75 hover:text-white transition-all transform hover:scale-110"
        >
          <SkipForward size={18} fill="currentColor" />
        </button>
      </div>

      {/* Material You Subtle Brand Accent Bar */}
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 relative z-10 group-hover:bg-brand-primary/40 transition-colors" />
    </div>
  );

  // If floating layout is requested, we wrap in an absolute Framer Motion div that supports dragging!
  if (floating) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        initial={{ opacity: 0, scale: 0.85, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 100 }}
        className="fixed bottom-24 right-6 w-80 h-56 z-50 rounded-[2.5rem] touch-none"
        style={{ cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
      >
        {/* drag handle label overlay */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-full text-[7.5px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
          <Move size={8} /> hold to drag widget
        </div>
        {widgetContent}
      </motion.div>
    );
  }

  // Otherwise, render full Android 13/14 Smartphone Launcher Mockup wrapper
  return (
    <div className="w-full max-w-sm mx-auto p-4 md:p-6 bg-black/[0.3] rounded-[3rem] border border-white/5 shadow-inner relative overflow-hidden group">
      {/* Dynamic ambient wallpaper simulation background */}
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-[#121c27] via-[#0b1016] to-[#251f2b] pointer-events-none z-0 opacity-80"
      />
      
      {/* Symmetrical Android Punch-Hole Camera */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-white/10 z-20 flex items-center justify-center p-0.5">
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-indigo-500/20" />
      </div>

      {/* Android Top StatusBar */}
      <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400 px-6 pt-1 pb-4 relative z-10 tracking-widest leading-none select-none">
        <div>{currentTime}</div>
        <div className="flex items-center gap-2">
          {/* Signal dots */}
          <div className="flex items-end gap-0.5 h-2.5">
            <div className="w-0.5 h-1 bg-brand-primary rounded-full" />
            <div className="w-0.5 h-1.5 bg-brand-primary rounded-full" />
            <div className="w-0.5 h-2 bg-brand-primary rounded-full" />
          </div>
          {/* Hifi Indicator */}
          <span className="text-[7.5px] bg-[#22d3ee]/10 text-[#22d3ee] px-1 py-0.5 rounded leading-none border border-[#22d3ee]/20 font-black">5G</span>
          {/* Battery pill */}
          <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center relative">
            <div className="h-full bg-emerald-500 rounded-sm w-[85%]" />
            <div className="absolute right-[-2.5px] top-[2.5px] w-0.5 h-1 bg-slate-500 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Main phone desktop background and simulator widget */}
      <div className="relative z-10 py-2 space-y-6 flex flex-col justify-center items-center">
        {/* Dynamic Android Clock and Weather */}
        <div className="text-center space-y-1 py-1 select-none">
          <h3 className="text-3xl font-black tracking-tightest text-white/95">{currentTime}</h3>
          <div className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center justify-center gap-1.5">
            <span>May 31 Voyager OS</span>
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-[#22d3ee]">☀️ 24°C</span>
          </div>
        </div>

        {/* Embedded Music Widget itself */}
        <div className="w-full h-56">
          {widgetContent}
        </div>

        {/* App Dock/Grid Preview in Android simulation */}
        <div className="w-full pt-4 border-t border-white/5 select-none grid grid-cols-4 gap-3">
          {[
            { name: 'Phone', color: 'bg-emerald-500', icon: Smartphone },
            { name: 'Sonara', color: 'bg-brand-primary text-black', icon: Music, active: true },
            { name: 'Settings', color: 'bg-slate-700', icon: Settings },
            { name: 'Theme', color: 'bg-[#6366f1]', icon: Layers },
          ].map((app, i) => (
            <div key={i} className="flex flex-col items-center gap-1 font-sans">
              <div 
                className={cn(
                  "w-11 h-11 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-105", 
                  app.color,
                  app.active && "ring-2 ring-brand-primary/40 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                )}
              >
                <app.icon size={18} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-wider text-slate-400 text-center truncate w-full",
                app.active && "text-brand-primary"
              )}>{app.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ambient bottom Android Navigation Gesture Pill */}
      <div className="w-24 h-1.5 bg-white/40 rounded-full mx-auto mt-6 relative z-10 hover:bg-white transition-colors" />
    </div>
  );
}
