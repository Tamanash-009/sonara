import { Play, Plus, Music, Sparkles, Clock, Star, TrendingUp, Zap, Smartphone } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { useAudio } from '../contexts/AudioContext';
import { streamingProvider } from '../services/streamingProvider';
import { Track } from '../types';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AndroidWidgetSimulator } from '../components/AndroidWidgetSimulator';

export function HomeView() {
  const navigate = useNavigate();
  const { tracks, isLoading, userName } = useLibrary();
  const { playTrack, currentTrack } = useAudio();
  const [trending, setTrending] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      const trendingData = await streamingProvider.getTrending();
      const recData = await streamingProvider.getRecommendations();
      setTrending(trendingData);
      setRecommendations(recData);
    };
    fetchContent();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '☀️';
    if (hour >= 12 && hour < 17) return '🌤️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
  };

  const recentTracks = tracks.map(t => t).sort((a, b) => b.addedAt - a.addedAt).slice(0, 30);

  if (tracks.length === 0 && !isLoading && trending.length === 0) {
    return null;
  }

  return (
    <div className="space-y-20 animate-slide-up pb-32">
      <header className="space-y-4 px-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tightest uppercase italic leading-tight flex flex-wrap items-center gap-x-4">
              <span>{getGreeting()},</span>
              <span className="text-brand-primary drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">{userName || 'Voyager'}</span>
              <span className="text-3xl md:text-4xl">{getGreetingEmoji()}</span>
            </h1>
          </div>
        </motion.div>
        <div className="flex items-center gap-4 ml-5">
          <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.4em]">
            Atmospheric Engine Initialized • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex items-center gap-1 glass-m px-3 py-1 rounded-full border-brand-primary/20">
             <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary/80">120Hz Mode Active</span>
          </div>
        </div>
      </header>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="space-y-8">
           <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-xl">
                <TrendingUp size={20} className="text-brand-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest italic">Global Trending</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Updated Hourly
            </div>
          </div>
          
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 -mx-6 px-6">
            {trending.map((track, i) => (
              <motion.div 
                key={track.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => playTrack(track)}
                className="flex-shrink-0 w-64 group cursor-pointer"
              >
                <div className="aspect-square rounded-[3rem] glass overflow-hidden relative shadow-2xl transition-all duration-700 transform group-hover:scale-[1.03] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] bg-white/5 border border-white/10">
                   <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale-[0.2] group-hover:grayscale-0" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />
                   
                   <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-bold truncate text-xl tracking-tight uppercase italic text-white mb-1 drop-shadow-lg">{track.title}</h3>
                      <p className="text-[10px] text-brand-primary truncate font-black uppercase tracking-widest drop-shadow-lg">{track.artist}</p>
                   </div>

                   <div className="absolute top-6 left-6 w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-all duration-500">
                      <Play size={18} fill="black" className="ml-1" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Discovery / Recommendations */}
      {recommendations.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest italic">Personalized for you</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            {recommendations.map((track) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className="glass-m p-5 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all group border border-white/5 active:scale-[0.98] shadow-xl"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 flex-shrink-0 overflow-hidden shadow-2xl relative border border-white/10">
                  <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-lg">
                      <Play size={18} fill="black" className="ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={10} className="text-brand-primary" strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Suggested Track</span>
                  </div>
                  <h3 className="font-bold text-lg truncate text-white uppercase tracking-tight mb-0.5">{track.title}</h3>
                  <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest leading-none">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Android Widget Showcase */}
      <section className="space-y-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="col-span-1 lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-brand-primary/10 rounded-2xl leading-none">
              <Smartphone size={22} className="text-brand-primary" />
            </span>
            <h2 className="text-2xl md:text-3.5xl font-black uppercase tracking-widest italic text-white leading-none">Sonara Desktop Widget</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
              Equip your launcher with a custom Material You dynamic widget, bound seamlessly to your active playback queues. Track covers emit custom color accent glows matching the sound character, complete with full responsive progress curves and gapless media state updates.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9.5px] font-black uppercase bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20 px-3.5 py-1 rounded-full tracking-widest font-sans">
                Material You Theme
              </span>
              <span className="text-[9.5px] font-black uppercase bg-[#6366f1]/10 text-indigo-400 border border-indigo-500/20 px-3.5 py-1 rounded-full tracking-widest font-sans">
                Full State Sync
              </span>
              <span className="text-[9.5px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1 rounded-full tracking-widest font-sans">
                Drag-to-Reposition
              </span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  const event = new CustomEvent('toggle-floating-android-widget');
                  window.dispatchEvent(event);
                }}
                className="px-8 py-4 bg-brand-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:bg-white active:scale-95 shadow-[0_4px_30px_rgba(34,211,238,0.25)]"
              >
                Launch Overlay Widget
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-5 flex justify-center w-full">
          <AndroidWidgetSimulator />
        </div>
      </section>

      {recentTracks.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/10 rounded-xl">
                <Clock size={20} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest italic">Recently Added</h2>
            </div>
            <button 
              onClick={() => navigate('/library?tab=recent')}
              className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {recentTracks.map((track) => (
              <div 
                key={track.id}
                onClick={() => playTrack(track)}
                className={cn(
                  "glass-m p-4 rounded-[32px] flex items-center gap-5 cursor-pointer hover:bg-white/10 transition-all group border border-white/5 active:scale-[0.98]",
                  currentTrack?.id === track.id ? "border-brand-primary/30 bg-brand-primary/5" : ""
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex-shrink-0 overflow-hidden shadow-xl relative border border-white/5">
                  {track.cover ? (
                    <img src={track.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-primary/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
                      <Music size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-bold text-sm truncate text-white uppercase tracking-tight mb-0.5">{track.title}</h3>
                  <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest leading-none">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


