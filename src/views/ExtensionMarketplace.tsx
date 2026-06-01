import React, { useState } from 'react';
import { useProviders } from '../contexts/ProviderContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Puzzle, CheckCircle2, Power, Settings2, ShieldCheck, Globe, Zap, ExternalLink } from 'lucide-react';

export function ExtensionMarketplace() {
  const { providers, toggleProvider, setDefaultProvider, providerHealth } = useProviders();
  const [selectedType, setSelectedType] = useState<string>('all');

  const filtered = providers.filter(p => selectedType === 'all' || p.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Globe size={14} />;
      case 'lyrics': return <Zap size={14} />;
      case 'metadata': return <ShieldCheck size={14} />;
      case 'recommendation': return <Settings2 size={14} />;
      default: return <Puzzle size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase italic drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">Extensions</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Bridge Provider Manager</p>
        </div>

        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {['all', 'music', 'metadata', 'lyrics', 'recommendation'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedType === type 
                  ? "bg-brand-primary text-black shadow-lg" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((provider) => (
          <motion.div
            layout 
            key={provider.id}
            className={cn(
              "glass-m p-6 rounded-[2.5rem] border transition-all group relative overflow-hidden",
              provider.status === 'enabled' ? "border-brand-primary/30" : "border-white/5"
            )}
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-opacity duration-700 pointer-events-none",
              provider.status === 'enabled' ? "bg-brand-primary/20 opacity-100" : "bg-white/5 opacity-0 group-hover:opacity-100"
            )} />

            <div className="flex gap-6 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-black/40 flex items-center justify-center border border-white/10 p-4 shadow-xl">
                <img src={provider.icon} alt={provider.name} className="w-full h-full object-contain filter drop-shadow-md" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tight italic">{provider.name}</h3>
                    {provider.isDefault && (
                      <span className="bg-brand-primary/20 text-brand-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-brand-primary/20">
                        Default
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "text-[8px] font-black uppercase tracking-[.2em] px-2 py-1 rounded-lg border flex items-center gap-1.5",
                    provider.status === 'enabled' 
                      ? (providerHealth?.[provider.id] === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500")
                      : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                  )}>
                    {provider.status === 'enabled' && providerHealth?.[provider.id] === 'loading' && (
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                    )}
                    {provider.status === 'enabled' && providerHealth?.[provider.id] === 'error' && (
                      <div className="w-1 h-1 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
                    )}
                    {providerHealth?.[provider.id] === 'error' ? 'Connection Error' : provider.status}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {getTypeIcon(provider.type)}
                  <span>{provider.type} provider</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>By {provider.author}</span>
                </div>

                <p className="text-sm text-slate-400 font-medium leading-relaxed pt-2">
                  {provider.description}
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => toggleProvider(provider.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                      provider.status === 'enabled'
                        ? "bg-white/5 border-white/5 text-rose-500 hover:bg-rose-500/10"
                        : "bg-brand-primary text-black border-brand-primary shadow-lg hover:scale-[1.02]"
                    )}
                  >
                    {provider.status === 'enabled' ? (
                      <Power size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {provider.status === 'enabled' ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => setDefaultProvider(provider.id, provider.type)}
                    className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
                    title="Set as Default"
                  >
                    <Settings2 size={16} />
                  </button>
                  
                  <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:border-white/20 transition-all">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
