import { Github, Twitter, Instagram, Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 pb-12 border-t border-white/5 pt-12 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="space-y-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-black italic text-xs">S</span>
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tightest">Sonara Engine</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
            The next-generation audio experience. Built for audiophiles, optimized for everyone. 
            Local-first, privacy-focused, and incredibly smooth.
          </p>
          <div className="flex items-center gap-4">
            <SocialLink icon={Github} href="https://github.com" />
            <SocialLink icon={Twitter} href="https://twitter.com" />
            <SocialLink icon={Instagram} href="https://instagram.com" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</h3>
          <ul className="space-y-2">
            <FooterLink label="Home" href="/" />
            <FooterLink label="Library" href="/library" />
            <FooterLink label="Playlists" href="/playlists" />
            <FooterLink label="Lyrics" href="/lyrics" />
            <FooterLink label="Search" href="/search" />
            <FooterLink label="Settings" href="/settings" />
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal</h3>
          <ul className="space-y-2">
            <FooterLink label="Privacy Policy" href="#" />
            <FooterLink label="Terms of Service" href="#" />
            <FooterLink label="Cookie Policy" href="#" />
            <FooterLink label="Copyright Info" href="#" />
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          © {year} Tamanash Chakraborty. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          <span>Handcrafted with</span>
          <Heart size={10} className="text-brand-primary fill-brand-primary/20 animate-pulse" />
          <span>in AI Studio</span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any; href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all active:scale-95"
    >
      <Icon size={18} />
    </a>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a 
        href={href}
        className="text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors tracking-tight"
      >
        {label}
      </a>
    </li>
  );
}
