import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle, FileAudio, Copy, XCircle } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';

export function ScanStatus() {
  const { scanProgress } = useLibrary();

  if (scanProgress.status === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[400px] max-w-[90vw]"
      >
        <div className="glass-m rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {scanProgress.status === 'scanning' ? (
                <Loader2 size={20} className="text-brand-primary animate-spin" />
              ) : (
                <CheckCircle2 size={20} className="text-green-500" />
              )}
              <h3 className="font-black uppercase tracking-widest text-xs italic">
                {scanProgress.status === 'scanning' ? 'Scanning Library' : 'Scan Complete'}
              </h3>
            </div>
            <p className="text-[10px] font-black text-slate-500">
              {scanProgress.processed} / {scanProgress.totalFound} Found
            </p>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <StatusIcon 
              icon={FileAudio} 
              label="Imported" 
              value={scanProgress.processed} 
              color="text-brand-primary" 
            />
            <StatusIcon 
              icon={Copy} 
              label="Duplicates" 
              value={scanProgress.duplicates} 
              color="text-amber-500" 
            />
            <StatusIcon 
              icon={XCircle} 
              label="Unsupported" 
              value={scanProgress.unsupported} 
              color="text-red-500" 
            />
            <StatusIcon 
              icon={AlertCircle} 
              label="Errors" 
              value={scanProgress.errors.length} 
              color="text-slate-500" 
            />
          </div>

          {scanProgress.status === 'scanning' && (
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(scanProgress.processed / Math.max(1, scanProgress.totalFound)) * 100}%` }}
              />
            </div>
          )}

          {scanProgress.errors.length > 0 && (
            <div className="max-h-24 overflow-y-auto no-scrollbar pt-2 border-t border-white/5">
              {scanProgress.errors.map((err, i) => (
                <p key={i} className="text-[10px] text-red-400 font-medium truncate">{err}</p>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusIcon({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="bg-white/5 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
      <Icon size={16} className={color} />
      <div className="flex-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="font-bold text-sm tracking-tight">{value}</p>
      </div>
    </div>
  );
}
