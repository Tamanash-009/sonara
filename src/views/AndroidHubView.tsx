import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useLibrary } from '../contexts/LibraryContext';
import { androidCodebase, SourceFile } from '../services/androidCodebase';
import { 
  Smartphone, Code, FileCode, ShieldCheck, DownloadCloud, Copy, Check, 
  Settings, Play, Pause, SkipForward, SkipBack, Cpu, Layers, Terminal, 
  ExternalLink, Sparkles, RefreshCw, AlertCircle, Headphones, CheckCircle2,
  Trash2, Battery, Wifi, Music, Award, Sliders, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function AndroidHubView() {
  const { 
    currentTrack, isPlaying, togglePlay, playNext, playPrevious, progress, 
    seek, repeatMode, setRepeatMode, shuffle, setShuffle, eq, setEQBand, 
    applyPreset, saveEQPerTrack, setSaveEQPerTrack 
  } = useAudio();
  const { tracks } = useLibrary();

  // IDE State
  const [activeFile, setActiveFile] = useState<SourceFile>(androidCodebase[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Phone Simulator Tab state
  // 'desktop' | 'app_player' | 'app_eq' | 'app_download' | 'security'
  const [phoneTab, setPhoneTab] = useState<'desktop' | 'app_player' | 'app_eq' | 'app_download' | 'security'>('desktop');
  
  // Custom mock download states for offline simulator
  const [downloadStates, setDownloadStates] = useState<Record<string, { progress: number, status: 'idle' | 'downloading' | 'completed' }>>({});
  const downloadingIntervals = useRef<Record<string, any>>({});

  // Dynamic system stats
  const [ramUsage, setRamUsage] = useState(28.4);
  const [cpuUsage, setCpuUsage] = useState(2.1);
  const [batteryLevel, setBatteryLevel] = useState(88);

  // Live dynamic clock
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

  // Performance simulation ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setRamUsage(prev => {
        const base = isPlaying ? 34.2 : 26.5;
        const jitter = Math.sin(Date.now() * 0.001) * 1.2;
        return parseFloat((base + jitter).toFixed(1));
      });
      setCpuUsage(prev => {
        const base = isPlaying ? 5.4 : 1.2;
        const jitter = Math.abs(Math.sin(Date.now() * 0.005)) * 2.8;
        return parseFloat((base + jitter).toFixed(1));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle source copying
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(activeFile.name);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  // Mock download trigger
  const handleDownloadTrack = (trackId: string) => {
    if (downloadStates[trackId]?.status === 'completed') {
      // Remove download / cache eviction
      setDownloadStates(prev => ({
        ...prev,
        [trackId]: { progress: 0, status: 'idle' }
      }));
      return;
    }

    setDownloadStates(prev => ({
      ...prev,
      [trackId]: { progress: 0, status: 'downloading' }
    }));

    let percent = 0;
    downloadingIntervals.current[trackId] = setInterval(() => {
      percent += Math.floor(Math.random() * 25) + 10;
      if (percent >= 100) {
        percent = 100;
        clearInterval(downloadingIntervals.current[trackId]);
        setDownloadStates(prev => ({
          ...prev,
          [trackId]: { progress: 100, status: 'completed' }
        }));
      } else {
        setDownloadStates(prev => ({
          ...prev,
          [trackId]: { progress: percent, status: 'downloading' }
        }));
      }
    }, 400);
  };

  // Preset settings for local EQ interaction
  const presetOptions = ['Flat', 'Rock', 'Pop', 'Classical', 'Jazz', 'Electronic', 'Acoustic'];

  const defaultTrack = {
    id: 'default',
    title: 'Sonara Stream',
    artist: 'Hifi Neural Engine',
    album: 'Atmosphere',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300',
  };

  const track = currentTrack || defaultTrack;

  return (
    <div className="space-y-12 pb-24">
      {/* Visual Header Grid Banner */}
      <header className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-[#17212d] to-[#0d141b] border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-xl text-[9px] font-black uppercase tracking-widest leading-none border border-brand-primary/20">
              Android Native Target SDK 34
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tightest italic leading-none text-white">
            Android Porting <span className="text-brand-primary">Workstation</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Configure, audit, and simulate Sonara as a true native Kotlin & Jetpack Compose application. Use the integrated high-fidelity emulator to explore dynamic widgets, offline caches, secure Keystore buffers, and clean Architecture components.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 relative z-10">
          <a 
            href="#emulator-anchor" 
            className="px-6 py-3.5 bg-brand-primary text-black rounded-2xl font-black text-[9.5px] uppercase tracking-widest transition-all hover:bg-white active:scale-95 shadow-[0_4px_25px_rgba(34,211,238,0.2)]"
          >
            Launch Phone Emulator
          </a>
          <button 
            onClick={() => setActiveFile(androidCodebase[0])}
            className="px-6 py-3.5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-[9.5px] uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
          >
            Load Source Editor
          </button>
        </div>
      </header>

      {/* Interactive Hub Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Enterprise Codebase Explorer (IDE Panel): 7 columns */}
        <section className="col-span-1 xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <Code size={18} />
              </span>
              <div className="space-y-0.5">
                <h2 className="text-xs font-black uppercase tracking-widest">Kotlin Source Explorer</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Clean Architecture Project Tree</p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-black text-indigo-400/80 bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10 uppercase tracking-widest">
              Hilt + ExoPlayer + Room
            </span>
          </div>

          <div className="bg-[#0b0f14] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[650px]">
            {/* File Editor Tab Bar */}
            <div className="bg-black/40 border-b border-white/5 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto select-none">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <span className="text-[10px] font-mono font-bold text-slate-400 truncate max-w-[280px]">
                  {activeFile.path}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(activeFile.content)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-slate-300 rounded-xl transition-all border border-white/5 active:scale-95"
                >
                  {copiedFile === activeFile.name ? (
                    <>
                      <Check size={11} className="text-brand-primary" />
                      <span className="text-brand-primary">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor Workspace Core */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Tree Navigator Panel */}
              <div className="w-52 md:w-60 bg-black/20 border-r border-white/5 overflow-y-auto p-4 flex flex-col gap-1.5 select-none custom-scrollbar">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] px-2 mb-2">Workspace Modules</p>
                {androidCodebase.map((file) => {
                  const isCur = activeFile.name === file.name;
                  return (
                    <button
                      key={file.name}
                      onClick={() => setActiveFile(file)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 border border-transparent",
                        isCur 
                          ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-inner"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                      )}
                    >
                      <FileCode size={13} className={isCur ? "text-brand-primary animate-pulse" : "text-indigo-400/80"} />
                      <div className="truncate flex-1">
                        <p className="text-[10px] font-black tracking-tight leading-none truncate">{file.name}</p>
                        <p className="text-[7.5px] font-mono text-slate-500 truncate mt-0.5 font-bold uppercase tracking-widest">{file.language}</p>
                      </div>
                    </button>
                  );
                })}

                <div className="mt-auto pt-6 border-t border-white/5 space-y-3 px-2">
                  <div className="space-y-1">
                    <p className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Architecture Model</p>
                    <p className="text-[8px] font-medium text-slate-500 leading-snug">
                      Modular layout adhering precisely to clean separation boundaries and pure domain models.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Code Display Screen */}
              <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-black/30">
                <pre className="font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto tab-size-4">
                  <code>
                    {activeFile.content.split('\n').map((line, idx) => (
                      <div key={idx} className="table-row">
                        <span className="table-cell text-right text-slate-600 select-none pr-4 w-8 text-[9px] font-black">{idx + 1}</span>
                        <span className="table-cell whitespace-pre">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Live Smartphone Interactive Simulator: 5 columns */}
        <section id="emulator-anchor" className="col-span-1 xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20">
                <Smartphone size={18} />
              </span>
              <div className="space-y-0.5">
                <h2 className="text-xs font-black uppercase tracking-widest">Voyager OS Emulator</h2>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Interactive Sandbox Device</p>
              </div>
            </div>
            
            {/* Quick action: Reset/refresh device */}
            <button 
              onClick={() => {
                setPhoneTab('desktop');
                setRamUsage(26.1);
              }}
              title="Reboot Simulated Device"
              className="p-1.5 rounded-lg border bg-white/5 border-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
            >
              <RefreshCw size={11} className="hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* Symmetrical Phone Frame Container */}
          <div className="w-full max-w-sm mx-auto p-4 bg-black/90 rounded-[3rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            
            {/* Ambient Wallpaper gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#121c27] via-[#0b1016] to-[#251f2b] pointer-events-none z-0 opacity-90" />
            
            {/* Physical front camera punch-hole notch */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-white/10 z-20 flex items-center justify-center p-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-brand-primary/10" />
            </div>

            {/* Android Status Bar */}
            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-slate-400 px-6 pt-1 pb-3 relative z-10 tracking-widest leading-none select-none">
              <div>{currentTime}</div>
              <div className="flex items-center gap-2">
                <span className="text-[7.5px] bg-brand-primary/10 text-brand-primary px-1 hover:animate-pulse rounded border border-brand-primary/20 font-black">5G LTE</span>
                <Wifi size={10} className="text-slate-400" />
                <div className="flex items-center gap-0.5">
                  <Battery size={11} className="text-slate-400" />
                  <span>{batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* Core Smartphone Viewport Screen: 520px height for optimal proportion */}
            <div className="h-[430px] rounded-2xl relative z-10 overflow-hidden flex flex-col justify-between bg-black/40">
              
              {/* Dynamic wallpaper aura from album artwork background */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.08] blur-xl scale-125 pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${track.cover})` }}
              />

              {/* Viewport Header depending on screens */}
              <div className="px-4 pt-3 pb-2 border-b border-white/5 bg-black/30 backdrop-blur-md flex items-center justify-between select-none shrink-0 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">
                    {phoneTab === 'desktop' && 'Android Home Launcher'}
                    {phoneTab === 'app_player' && 'Compose NowPlaying'}
                    {phoneTab === 'app_eq' && 'MVVM Equalizer'}
                    {phoneTab === 'app_download' && 'Offline Storage Cache'}
                    {phoneTab === 'security' && 'OWASP Security Monitor'}
                  </span>
                </div>
                {/* Micro Benchmark indicators */}
                <span className="text-[7.5px] font-mono font-bold text-[#22d3ee]">
                  RAM: {ramUsage}MB
                </span>
              </div>

              {/* Viewport Main dynamic screen routes */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                
                {/* ROUTE 1: DESKTOP HOME SCREEN WITH REAL-TIME MUSIC PLAYER WIDGET */}
                {phoneTab === 'desktop' && (
                  <div className="space-y-4 pt-2">
                    {/* Widget Clock Dashboard */}
                    <div className="text-center space-y-0.5 select-none py-1">
                      <h3 className="text-2xl font-black tracking-tightest text-white/95">{currentTime}</h3>
                      <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-slate-400">Voyager Mobile OS</p>
                    </div>

                    {/* INTERACTIVE MATERIAL YOU PLAYBACK WIDGET */}
                    <div 
                      className="w-full p-3.5 rounded-3xl flex flex-col justify-between relative overflow-hidden select-none border border-white/10 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(23, 29, 38, 0.95), rgba(13, 17, 23, 0.98))',
                      }}
                    >
                      <div className="flex gap-3 items-center">
                        <img 
                          src={track.cover} 
                          alt="" 
                          className={cn("w-11 h-11 rounded-xl object-cover border border-white/5", isPlaying && "animate-[spin_20s_linear_infinite]")} 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[7px] font-black uppercase text-brand-primary tracking-widest leading-none mb-0.5">Widget Media</p>
                          <h4 className="font-extrabold text-xs text-white truncate leading-tight">{track.title}</h4>
                          <p className="text-[9px] text-slate-300 font-bold truncate">{track.artist}</p>
                        </div>
                      </div>

                      {/* Animated wave progress simulation */}
                      <div className="w-full space-y-1 mt-3">
                        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="absolute h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[6.5px] font-bold font-mono text-slate-500">
                          <span>WIDGET LOCK</span>
                          <span>{isNaN(progress) ? '0%' : `${Math.round(progress)}%`}</span>
                        </div>
                      </div>

                      {/* Symmetrical Action widget buttons synced directly to the React application audio Context! */}
                      <div className="flex items-center justify-between px-2 mt-2">
                        <button 
                          onClick={playPrevious}
                          className="p-1 rounded-full hover:bg-white/5 text-white/60 active:scale-90 transition-transform"
                        >
                          <SkipBack size={13} fill="currentColor" />
                        </button>
                        <button 
                          onClick={togglePlay}
                          className="w-7 h-7 rounded-full bg-brand-primary text-black flex items-center justify-center active:scale-95 shadow-md shadow-brand-primary/20"
                        >
                          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} className="ml-0.5" fill="currentColor" />}
                        </button>
                        <button 
                          onClick={playNext}
                          className="p-1 rounded-full hover:bg-white/5 text-white/60 active:scale-90 transition-transform"
                        >
                          <SkipForward size={13} fill="currentColor" />
                        </button>
                      </div>
                    </div>

                    {/* App Grid Drawer Icons */}
                    <div className="grid grid-cols-4 gap-3 pt-2">
                      {[
                        { name: 'Sonara Music', icon: Music, color: 'bg-brand-primary text-black', action: () => setPhoneTab('app_player') },
                        { name: 'Equalizer', icon: Sliders, color: 'bg-indigo-600', action: () => setPhoneTab('app_eq') },
                        { name: 'Downloads', icon: DownloadCloud, color: 'bg-emerald-600', action: () => setPhoneTab('app_download') },
                        { name: 'Security', icon: ShieldCheck, color: 'bg-slate-700', action: () => setPhoneTab('security') },
                      ].map((app, i) => (
                        <button 
                          key={i} 
                          onClick={app.action}
                          className="flex flex-col items-center gap-1 group/app cursor-pointer"
                        >
                          <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-90 border border-white/5", app.color)}>
                            <app.icon size={15} />
                          </div>
                          <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 truncate w-full text-center group-hover/app:text-white transition-colors">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROUTE 2: SAMPLER PREMIUM NOWPLAYING SCREEN */}
                {phoneTab === 'app_player' && (
                  <div className="space-y-4 pt-1 flex flex-col justify-between h-full">
                    {/* Media metadata */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border border-white/5 relative bg-slate-900">
                        <img 
                          src={track.cover} 
                          alt="" 
                          className={cn("w-full h-full object-cover transition-transform duration-1000", isPlaying && "scale-105 rotate-3")} 
                        />
                      </div>
                      <div className="pt-2">
                        <h4 className="font-extrabold text-xs text-white tracking-tight">{track.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{track.artist}</p>
                      </div>
                    </div>

                    {/* Seamless Playback Mode Selector & status indicators */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-2.5 space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Composite State Engine</span>
                        <div className="flex items-center gap-1.5">
                          {shuffle && <span className="text-[7px] bg-brand-primary/10 text-brand-primary border border-brand-primary/15 px-1 py-0.5 rounded uppercase font-black tracking-widest">Shuffle Active</span>}
                          {repeatMode !== 'none' && <span className="text-[7px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-1 py-0.5 rounded uppercase font-black tracking-widest">Repeat: {repeatMode}</span>}
                        </div>
                      </div>

                      {/* Interactive controller modes */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => setShuffle(!shuffle)}
                          className={cn(
                            "py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all border",
                            shuffle 
                              ? "bg-brand-primary/15 border-brand-primary/25 text-brand-primary" 
                              : "bg-black/30 border-white/5 text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Shuffle Modes
                        </button>
                        <button
                          onClick={() => {
                            const nextMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
                            setRepeatMode(nextMode);
                          }}
                          className={cn(
                            "py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all border",
                            repeatMode !== 'none' 
                              ? "bg-indigo-500/15 border-indigo-500/25 text-indigo-400" 
                              : "bg-black/30 border-white/5 text-slate-500 hover:text-slate-300"
                          )}
                        >
                          Repeat Modes
                        </button>
                      </div>
                    </div>

                    {/* Symmetrical play buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={playPrevious} className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 rounded-full active:scale-90 transition-transform">
                        <SkipBack size={13} fill="currentColor" />
                      </button>
                      <button onClick={togglePlay} className="w-10 h-10 bg-brand-primary text-black rounded-full flex items-center justify-center active:scale-95 shadow-md shadow-brand-primary/20">
                        {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} className="ml-0.5" fill="currentColor" />}
                      </button>
                      <button onClick={playNext} className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 rounded-full active:scale-90 transition-transform">
                        <SkipForward size={13} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ROUTE 3: MVVM EQUALIZER UI MODULE */}
                {phoneTab === 'app_eq' && (
                  <div className="space-y-3 pt-1">
                    {/* Equalizer details */}
                    <div className="flex justify-between items-center text-[7px] font-black bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="text-slate-400 uppercase tracking-widest">Active Equalizer Tunnels</span>
                      <span className={cn("px-1.5 py-0.5 rounded leading-none uppercase", eq.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                        {eq.enabled ? 'Live System Filters' : 'Bypass Tunnel'}
                      </span>
                    </div>

                    {/* Scope Selector */}
                    <div className="grid grid-cols-2 gap-1 px-1 bg-black/40 rounded-xl p-0.5 border border-white/5">
                      <button
                        onClick={() => setSaveEQPerTrack(false)}
                        className={cn("py-1 text-[7.5px] font-black uppercase tracking-wider rounded-lg transition-all", !saveEQPerTrack ? "bg-brand-primary text-black" : "text-slate-500")}
                      >
                        Global EQ
                      </button>
                      <button
                        onClick={() => setSaveEQPerTrack(true)}
                        className={cn("py-1 text-[7.5px] font-black uppercase tracking-wider rounded-lg transition-all", saveEQPerTrack ? "bg-brand-primary text-black" : "text-slate-500")}
                      >
                        Track EQ
                      </button>
                    </div>

                    {/* Predefined capsules */}
                    <div className="flex flex-wrap gap-1 py-1 max-h-12 overflow-y-auto">
                      {presetOptions.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => applyPreset(preset)}
                          className={cn(
                            "px-2 py-1 text-[7px] font-black rounded-md border tracking-wider uppercase transition-all",
                            eq.preset === preset 
                              ? "bg-indigo-500/20 text-indigo-400 border-indigo-400/40" 
                              : "bg-white/[0.02] text-slate-500 border-white/5"
                          )}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Miniature interactive bands linking to actual player volume limits */}
                    <div className="grid grid-cols-5 gap-2 pt-1 h-24 items-end bg-black/20 p-2.5 rounded-xl border border-white/5">
                      {eq.bands.slice(0, 5).map((band, idx) => (
                        <div key={idx} className="flex flex-col items-center h-full gap-1.5 relative group">
                          {/* Mini vertical slider track */}
                          <div className="flex-1 w-1 bg-white/10 rounded-full relative overflow-hidden flex items-end">
                            <div 
                              className="w-full bg-brand-primary transition-all duration-300"
                              style={{ height: `${((band.gain + 12) / 24) * 100}%` }}
                            />
                            <input 
                              type="range"
                              min="-12"
                              max="12"
                              step="1"
                              value={band.gain}
                              onChange={(e) => setEQBand(idx, parseFloat(e.target.value))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize orient-vertical"
                            />
                          </div>
                          <span className="text-[6.5px] font-mono text-slate-500 uppercase font-black">
                            {band.frequency >= 1000 ? `${band.frequency / 1000}k` : band.frequency}
                          </span>
                          <span className="text-[6px] font-mono text-brand-primary font-bold">
                            {band.gain > 0 ? `+${band.gain}` : band.gain}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROUTE 4: OFFLINE CACHE AND DOWNLOAD MANAGEMENT */}
                {phoneTab === 'app_download' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-[7px] font-bold uppercase bg-white/5 border border-white/10 p-2 rounded-xl">
                      <span className="text-slate-400 tracking-wider">Device storage space</span>
                      <span className="text-emerald-400 font-black">Available: 4.8 GB</span>
                    </div>

                    <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                      {tracks.slice(0, 4).map((item) => {
                        const curState = downloadStates[item.id] || { progress: 0, status: 'idle' };
                        return (
                          <div 
                            key={item.id}
                            className="p-2 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <img src={item.cover} alt="" className="w-7 h-7 rounded-md object-cover border border-white/5 shrink-0" />
                              <div className="min-w-0">
                                <h5 className="text-[9px] font-black text-white truncate leading-none mb-0.5">{item.title}</h5>
                                <p className="text-[7.5px] text-slate-400 truncate leading-none font-bold">{item.artist}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadTrack(item.id)}
                              className="p-1 rounded-lg hover:bg-white/5 active:scale-90 text-slate-400 hover:text-white transition-all shrink-0"
                            >
                              {curState.status === 'completed' ? (
                                <span className="text-[7px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black flex items-center gap-0.5">
                                  <CheckCircle2 size={8} /> Saved
                                </span>
                              ) : curState.status === 'downloading' ? (
                                <span className="text-[7px] text-[#22d3ee] font-mono font-black animate-pulse">
                                  {curState.progress}%
                                </span>
                              ) : (
                                <DownloadCloud size={12} className="text-slate-400 hover:text-brand-primary" />
                              )}
                            </button>

                            {curState.status === 'downloading' && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                                <div className="h-full bg-brand-primary" style={{ width: `${curState.progress}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-black/40 border border-white/5 p-2 rounded-xl flex items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Garbage Collector Auto-Limit</p>
                        <p className="text-[6.5px] text-slate-500 leading-tight">Removes unplayed tracks when memory is lower than 500MB.</p>
                      </div>
                      <span className="text-[7px] font-black font-mono text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                    </div>
                  </div>
                )}

                {/* ROUTE 5: OWASP & CYBERSECURITY AUDITOR */}
                {phoneTab === 'security' && (
                  <div className="space-y-2 pt-1 font-mono">
                    <div className="bg-black/50 border border-white/10 p-2 rounded-xl space-y-1.5">
                      <p className="text-[7px] font-black uppercase tracking-wider text-[#22d3ee] flex items-center gap-1.5">
                        <ShieldCheck size={10} /> Active Security Monitor
                      </p>
                      
                      <div className="space-y-1 text-[7.5px] text-slate-400">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>OWASP ROOT DETECT</span>
                          <span className="text-emerald-400 font-bold">PASSED (Anti-Tamper)</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>SSL CERT PINNING</span>
                          <span className="text-emerald-400 font-bold">PINNED</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>ANDROID KEYSTORE</span>
                          <span className="text-indigo-400 font-bold">AES-GCM MUTUAL_LOCK</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>PROGUARD SYSTEM</span>
                          <span className="text-indigo-400 font-bold">OBFUSCATED</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>COLD BOOT METRIC</span>
                          <span className="text-[#22d3ee] font-black">1.18 SECONDS (Target &lt; 2s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-xl flex items-center gap-2">
                      <AlertCircle size={10} className="text-yellow-400 shrink-0" />
                      <p className="text-[6.5px] text-slate-500 leading-snug">
                        Strict signature structures check block debug-mode attaching, shielding users from token leakage.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Viewport Symmetrical OS Navigation pills: Tap to route inside the emulator */}
              <div className="bg-black/80 backdrop-blur-md border-t border-white/5 py-1 px-4 flex items-center justify-around shrink-0 relative z-10 select-none">
                {[
                  { tab: 'desktop', name: 'Launcher', icon: Smartphone },
                  { tab: 'app_player', name: 'Native Player', icon: Music },
                  { tab: 'app_eq', name: 'Equalizer', icon: Sliders },
                  { tab: 'app_download', name: 'Downloads', icon: DownloadCloud },
                  { tab: 'security', name: 'Security', icon: ShieldCheck },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setPhoneTab(item.tab as any);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-2 py-1 transition-all rounded-lg active:scale-90 border border-transparent",
                      phoneTab === item.tab 
                        ? "text-brand-primary bg-brand-primary/10 border-brand-primary/10" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <item.icon size={11} />
                    <span className="text-[6.5px] font-black uppercase tracking-wider leading-none mt-0.5">{item.name}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* Bottom OS gesture touchline feedback */}
            <div className="w-20 h-1 bg-white/40 rounded-full mx-auto mt-3 hover:bg-white transition-colors" />
          </div>
        </section>

      </div>

      {/* Integration Step Guides for Play Store and Native Building */}
      <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <Award size={20} />
          </span>
          <div className="space-y-0.5">
            <h3 className="text-xl font-black uppercase tracking-widest italic leading-none text-white">Capacitor Deployment Guide</h3>
            <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest leading-none">Assemble Sonara into full-hardware APK</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Establish SDK Integration",
              desc: "Incorporate Capacitor Core inside this project, establishing local sandboxes and dynamic bridging definitions.",
              cmd: "npm install @capacitor/core @capacitor/cli @capacitor/android"
            },
            {
              step: "02",
              title: "Compile Web Dist",
              desc: "Run full production build systems, exporting assets, indexes, and optimized service lines inside /dist.",
              cmd: "npm run build && npx cap init \"Sonara Music\" \"com.sonara.music\""
            },
            {
              step: "03",
              title: "Compile Native Gradients",
              desc: "Add Android target templates, compile and obfuscate dependencies, and generate APK formats with Gradle.",
              cmd: "npx cap add android && npx cap open android"
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-[2rem] bg-black/40 border border-white/5 relative group hover:border-white/10 transition-colors">
              <span className="text-4xl font-extrabold text-brand-primary/20 absolute top-4 right-6 group-hover:text-brand-primary/40 transition-colors">{item.step}</span>
              <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">{item.desc}</p>
              <div className="bg-black/60 border border-white/5 p-3 rounded-xl font-mono text-[9px] text-[#22d3ee] overflow-x-auto">
                <span className="text-slate-500 selection:bg-none">$ </span>{item.cmd}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
