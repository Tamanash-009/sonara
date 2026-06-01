import { motion } from 'motion/react';
import { Music } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(40px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
      className="fixed inset-0 z-[9999] bg-[#0f141a] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background System Effects */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f141a_80%)]" />
      </div>
      
      <div className="relative flex flex-col items-center gap-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Engine Core Visual */}
          <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative z-10 overflow-hidden">
             <Music size={48} className="text-brand-primary" />
             <motion.div 
               animate={{ y: ["-100%", "200%"] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-brand-primary/20 to-transparent rotate-45" 
             />
          </div>

          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-8 border border-white/5 rounded-full"
              style={{ padding: i * 12 }}
            />
          ))}
        </motion.div>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-black tracking-tightest text-white uppercase italic leading-none"
            >
              Sonara <span className="text-brand-primary">Engine</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
              className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500"
            >
              Initializing 120Hz Interface
            </motion.div>
          </div>
          
          <div className="w-64 h-0.5 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary to-transparent"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
