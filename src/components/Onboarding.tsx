import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Music, FolderOpen, Database, ArrowRight, CheckCircle2, User, Sparkles, Headphones } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { cn } from '../lib/utils';

export function Onboarding() {
  const { scanDirectory, loadDemoLibrary, setUserName, completeOnboarding } = useLibrary();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const nextStep = () => setStep(s => s + 1);

  const handleComplete = () => {
    if (name.trim()) {
      setUserName(name.trim());
      completeOnboarding();
    }
  };

  const steps = [
    {
      id: 'welcome',
      content: (
        <div className="space-y-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-32 h-32 bg-brand-primary rounded-[2.5rem] flex items-center justify-center m-auto shadow-[0_0_50px_rgba(34,211,238,0.3)] relative group cursor-default"
          >
            <Headphones size={64} className="text-black group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] animate-pulse" />
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-5xl md:text-7xl font-black tracking-tightest uppercase italic leading-none"
            >
              Sonara <span className="text-brand-primary">Engine</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-[0.5em] max-w-sm mx-auto leading-relaxed"
            >
              Next-Generation High Fidelity Audio Experience
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={nextStep}
            className="group relative px-12 py-6 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-95"
          >
            <span className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-brand-primary transition-colors">Begin Initialization</span>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </motion.button>
        </div>
      )
    },
    {
      id: 'name',
      content: (
        <div className="space-y-12 text-center w-full max-w-md mx-auto">
          <div className="space-y-2">
             <motion.h2 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-3xl font-black uppercase italic tracking-tightest"
             >
               Welcome Voyager
             </motion.h2>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">How should the Engine address you?</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's your name?"
              className="w-full bg-white/5 border-b-2 border-white/10 focus:border-brand-primary py-6 px-4 text-2xl font-black uppercase italic tracking-tightest outline-none transition-all placeholder:text-white/10 text-center"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
            />
            {name.trim() && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-black shadow-xl"
              >
                <Sparkles size={20} />
              </motion.div>
            )}
          </motion.div>

          <motion.button
            disabled={!name.trim()}
            onClick={nextStep}
            className="w-full py-5 bg-brand-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all flex items-center justify-center gap-3 overflow-hidden relative"
          >
            Next Configuration
            <ArrowRight size={18} />
          </motion.button>
        </div>
      )
    },
    {
      id: 'import',
      content: (
        <div className="space-y-12 text-center w-full max-w-2xl mx-auto">
          <div className="space-y-2">
             <h3 className="text-3xl font-black uppercase italic tracking-tightest">
               Hello, <span className="text-brand-primary">{name}</span>
             </h3>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">The Engine is ready for your local library</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="glass border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-brand-primary/30 transition-all group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <FolderOpen size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black uppercase italic tracking-widest text-sm">Local Access</h4>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed pt-2">Direct filesystem integration for ultra-low latency playback.</p>
                </div>
             </div>
             <div className="glass border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-indigo-500/30 transition-all group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black uppercase italic tracking-widest text-sm">Engine Tuning</h4>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed pt-2">Dynamic glassmorphism and 120Hz optimized fluid UI.</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                scanDirectory().then(() => handleComplete());
              }}
              className="px-10 py-5 bg-brand-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={18} />
              Import Local Library
            </button>
            <button 
              onClick={() => {
                loadDemoLibrary();
                handleComplete();
              }}
              className="px-10 py-5 bg-white/5 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <Database size={18} className="text-slate-500" />
              Demo Data
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden bg-[#0f141a]">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px]" 
        />
        
        {/* Floating Particles (Simulated with div dots) */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
            className="absolute w-1 h-1 bg-white rounded-full bg-blur"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={steps[step].id}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full"
        >
          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1 transition-all duration-700 rounded-full shadow-lg",
              i === step ? "w-8 bg-brand-primary" : "w-2 bg-white/10"
            )} 
          />
        ))}
      </div>
    </div>
  );
}

