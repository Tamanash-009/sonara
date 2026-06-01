import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center glass-m rounded-[48px] border border-white/5"
    >
      <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-slate-500 mb-8 border border-white/5 shadow-inner">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <div className="space-y-3 max-w-md">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">{title}</h2>
        <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="mt-10 px-10 py-4 bg-brand-primary text-black rounded-[24px] font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
