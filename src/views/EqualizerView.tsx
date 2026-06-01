import { useAudio, EQ_PRESETS, EQ_BANDS } from '../contexts/AudioContext';
import { cn } from '../lib/utils';
import { Sliders, Check, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function EqualizerView() {
  const { eq, setEQBand, toggleEQ, applyPreset, isPlaying, analyserRef, saveEQPerTrack, setSaveEQPerTrack } = useAudio();
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(EQ_BANDS.length).fill(0));
  const requestRef = useRef<number>(null);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      setVisualizerData(new Array(EQ_BANDS.length).fill(0));
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Map spectrum to our 5 bands
      // This is a rough estimation
      const bandsCount = EQ_BANDS.length;
      const step = Math.floor(bufferLength / (bandsCount * 2)); // Use lower half of spectrum
      const newVisualizerData = [];
      
      for (let i = 0; i < bandsCount; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        newVisualizerData.push(sum / step / 255); // Normalize to 0-1
      }
      
      setVisualizerData(newVisualizerData);
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, analyserRef]);

  return (
    <div className="space-y-10 animate-slide-up pb-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase italic drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">Equalizer</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acoustic Architecture</p>
        </div>
        <button 
          onClick={toggleEQ}
          className={cn(
            "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[.2em] transition-all border",
            eq.enabled 
              ? "bg-brand-primary text-black border-brand-primary shadow-[0_0_30px_rgba(34,211,238,0.4)]" 
              : "bg-white/5 text-slate-500 border-white/5 hover:text-white"
          )}
        >
          {eq.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </header>

      {/* Target Mode Selector (Global vs Per-Track) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[2rem] bg-white/[0.02] border border-white/5">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-[9px] font-black uppercase text-brand-primary tracking-[0.25em]">Scope Bounds Settings</p>
          <p className="text-xs text-slate-400 font-medium max-w-md">Choose whether equalizer presets and bands apply globally to all music, or automatically save per-track.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button
            onClick={() => setSaveEQPerTrack(false)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              !saveEQPerTrack
                ? "bg-brand-primary text-black font-black shadow-inner"
                : "text-slate-500 hover:text-slate-200"
            )}
          >
            Global EQ
          </button>
          <button
            onClick={() => setSaveEQPerTrack(true)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
              saveEQPerTrack
                ? "bg-brand-primary text-black font-black shadow-inner"
                : "text-slate-500 hover:text-slate-200"
            )}
          >
            Per-Track EQ
          </button>
        </div>
      </div>

      {/* EQ Sliders */}
      <div className="glass-m p-8 md:p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-2xl">
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          {visualizerData.map((val, i) => (
            <motion.div 
              key={i}
              className="absolute bottom-0 bg-brand-primary/20 blur-[60px] rounded-full"
              animate={{ 
                height: `${val * 100}%`,
                width: `${val * 200 + 100}px`,
                x: `${i * 25}%`,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              style={{ left: '-10%' }}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-end h-[340px] gap-2 md:gap-8 lg:gap-16 relative z-10">
          {eq.bands.map((band, i) => (
            <div key={band.frequency} className="flex-1 flex flex-col items-center gap-8 h-full">
              <div className="relative flex-1 w-full flex justify-center group">
                {/* Visual Track */}
                <div className="absolute inset-y-0 w-2 bg-black/40 rounded-full border border-white/5 shadow-inner" />
                
                {/* Visualizer Pulsing Track (Underlay) */}
                <motion.div 
                   className="absolute bottom-0 w-2 bg-brand-primary/10 rounded-full blur-sm"
                   animate={{ height: `${visualizerData[i] * 100}%` }}
                />

                {/* Active Track Highlight */}
                <div 
                  className={cn(
                    "absolute bottom-0 w-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]",
                    eq.enabled ? "bg-gradient-to-t from-indigo-500 to-brand-primary opacity-100" : "bg-slate-600 opacity-20"
                  )}
                  style={{ 
                    height: `${((band.gain + 12) / 24) * 100}%`,
                  }}
                />

                {/* Vertical Slider */}
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={band.gain}
                  onChange={(e) => setEQBand(i, parseFloat(e.target.value))}
                  disabled={!eq.enabled}
                  className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-20"
                  style={{ 
                    writingMode: 'bt-lr',
                    WebkitAppearance: 'slider-vertical' as any
                  } as any}
                />

                {/* Thumb Indicator */}
                <motion.div 
                  className={cn(
                    "absolute w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl border transition-all z-10",
                    eq.enabled 
                      ? "bg-white border-brand-primary cursor-grab active:scale-95 active:cursor-grabbing hover:shadow-brand-primary/20" 
                      : "bg-slate-800 border-white/5 cursor-not-allowed opacity-50"
                  )}
                  style={{ 
                    bottom: `calc(${((band.gain + 12) / 24) * 100}% - 24px)`,
                  }}
                  animate={{ 
                    scale: eq.enabled && isPlaying ? 1 + visualizerData[i] * 0.1 : 1
                  }}
                >
                   <div className="flex gap-1 items-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-brand-primary opacity-40" />
                     <div className={cn("w-1 h-4 rounded-full", eq.enabled ? "bg-brand-primary" : "bg-slate-600")} />
                     <div className="w-1.5 h-1.5 rounded-full bg-brand-primary opacity-40" />
                   </div>
                </motion.div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[.25em]">
                  {band.frequency >= 1000 ? `${band.frequency / 1000}kHz` : `${band.frequency}Hz`}
                </p>
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-mono font-black border transition-all",
                  eq.enabled 
                    ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-[0_0_10px_rgba(34,211,238,0.1)]" 
                    : "bg-white/5 border-white/5 text-slate-600"
                )}>
                  {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} <span className="opacity-40">dB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Presets</h3>
          <button 
            onClick={() => applyPreset('Flat')}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(EQ_PRESETS).map((presetName) => (
            <button
              key={presetName}
              onClick={() => applyPreset(presetName)}
              className={cn(
                "p-4 rounded-2xl glass-m border transition-all text-left group overflow-hidden relative",
                eq.preset === presetName 
                  ? "border-brand-primary/50 bg-brand-primary/5" 
                  : "border-white/5 hover:border-white/20 active:scale-95"
              )}
            >
              <div className={cn(
                "absolute top-0 right-0 p-2 transition-transform duration-500",
                eq.preset === presetName ? "translate-x-0" : "translate-x-full"
              )}>
                 <Check size={16} className="text-brand-primary" />
              </div>
              <p className={cn(
                "font-bold text-sm uppercase tracking-tight",
                eq.preset === presetName ? "text-brand-primary" : "text-slate-400 group-hover:text-white"
              )}>
                {presetName}
              </p>
            </button>
          ))}
          
          <div className={cn(
            "p-4 rounded-2xl glass-m border border-brand-primary/20 bg-indigo-500/5 relative overflow-hidden transition-all",
            eq.preset === 'Manual' ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
          )}>
             <p className="font-bold text-sm uppercase tracking-tight text-white">Manual</p>
             <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Custom Tuning</p>
             <div className="absolute -bottom-2 -right-2 opacity-10">
               <Sliders size={48} />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
