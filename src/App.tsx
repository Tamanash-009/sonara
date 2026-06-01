/**
 * @license
 * © 2026 Tamanash Chakraborty. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Music, LayoutList, History, Settings, Mic2, Search, Sliders, MoreHorizontal as MoreIcon, Smartphone } from 'lucide-react';
import { AudioProvider } from './contexts/AudioContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { ProviderProvider } from './contexts/ProviderContext';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { PlaylistsView } from './views/PlaylistsView';
import { LyricsView } from './views/LyricsView';
import { EqualizerView } from './views/EqualizerView';
import { SearchView } from './views/SearchView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { AndroidHubView } from './views/AndroidHubView';
import { AlbumDetailView } from './views/AlbumDetailView';
import { ArtistDetailView } from './views/ArtistDetailView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { NowPlayingSheet } from './components/NowPlayingSheet';
import { LoadingScreen } from './components/LoadingScreen';
import { Onboarding } from './components/Onboarding';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScanStatus } from './components/ScanStatus';
import { cn } from './lib/utils';
import { useLibrary } from './contexts/LibraryContext';
import { motion, AnimatePresence } from 'motion/react';
import { AndroidWidgetSimulator } from './components/AndroidWidgetSimulator';

function Navigation({ isSidebar = false }: { isSidebar?: boolean }) {
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/library', icon: Music, label: 'Library' },
    { to: '/playlists', icon: LayoutList, label: 'Playlists' },
    { to: '/android-hub', icon: Smartphone, label: 'Android Hub' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/lyrics', icon: Mic2, label: 'Lyrics', mobileHide: true },
    { to: '/history', icon: History, label: 'History', mobileHide: true },
    { to: '/settings', icon: Settings, label: 'Settings', mobileHide: true },
  ];

  const filteredItems = isMobileView ? navItems.filter(item => !item.mobileHide) : navItems;

  if (isSidebar) {
    return (
      <nav className="flex flex-col gap-4 py-8 px-4 w-72 h-full glass border-r border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="flex items-center gap-4 px-4 mb-10 group cursor-default">
           <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Music className="text-black" />
           </div>
           <div className="space-y-0.5">
              <h2 className="text-lg font-black uppercase italic tracking-tightest">Sonara</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Engine Pro</p>
           </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border border-transparent",
                  isActive 
                    ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-[0_0_20px_rgba(34,211,238,0.05)]" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
           <div className="glass border border-white/5 rounded-[2rem] p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Fidelity</h3>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-widest">120Hz Interface</span>
                </div>
              </div>
           </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-[var(--safe-area-bottom)] left-4 right-4 md:left-6 md:right-6 h-20 glass rounded-[32px] flex items-center justify-around px-4 z-40 shadow-2xl transition-all duration-500 max-w-lg mx-auto">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 relative",
              isActive ? "text-brand-primary" : "text-slate-400 hover:text-slate-100"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
                  isActive && "bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                )}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && (
                   <motion.div 
                     layoutId="nav-dot" 
                     className="absolute -top-1 w-1 h-1 bg-brand-primary rounded-full"
                   />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function RoutePersistence() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const lastPath = localStorage.getItem('sonara_last_path');
    if (lastPath && !hasRestored && lastPath !== location.pathname) {
      navigate(lastPath, { replace: true });
    }
    setHasRestored(true);
  }, []);

  useEffect(() => {
    if (hasRestored) {
      localStorage.setItem('sonara_last_path', location.pathname);
    }
  }, [location.pathname, hasRestored]);

  return null;
}

function AppContent() {
  const { isLoading: isLibraryLoading, isOnboarded } = useLibrary();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isDesktopLayout, setIsDesktopLayout] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktopLayout(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    
    const handleToggleWidget = () => setShowFloatingWidget(prev => !prev);
    window.addEventListener('toggle-floating-android-widget', handleToggleWidget);
    
    const timer = setTimeout(() => setIsAppLoading(false), 1500);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('toggle-floating-android-widget', handleToggleWidget);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Router>
      <RoutePersistence />
      <div className="min-h-screen bg-[#0f141a] text-slate-100 flex relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {isAppLoading && <LoadingScreen key="loader" />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isAppLoading && !isOnboarded && <Onboarding key="onboarding" />}
        </AnimatePresence>
        
        {/* Background Gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-cyan-900/20 pointer-events-none z-0" />
        
        {isDesktopLayout && <Navigation isSidebar />}

        <div className="flex-1 flex flex-col min-w-0 pb-64 lg:pb-0 h-screen overflow-y-auto custom-scrollbar relative z-10">
          <Header />

          <main className={cn(
            "flex-1 px-4 sm:px-6 relative z-10 pt-8 w-full mx-auto transition-all duration-500",
            isDesktopLayout ? "max-w-none px-12" : "max-w-7xl"
          )}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/library" element={<LibraryView />} />
              <Route path="/playlists" element={<PlaylistsView />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/equalizer" element={<EqualizerView />} />
              <Route path="/lyrics" element={<LyricsView />} />
              <Route path="/search" element={<SearchView />} />
              <Route path="/android-hub" element={<AndroidHubView />} />
              <Route path="/album/:albumName" element={<AlbumDetailView />} />
              <Route path="/artist/:artistName" element={<ArtistDetailView />} />
              <Route path="/playlist/:playlistId" element={<PlaylistDetailView />} />
            </Routes>
          </main>

          <ScanStatus />
          {!isDesktopLayout && <Navigation />}
          <Footer />
        </div>

        <NowPlayingSheet />

        <AnimatePresence>
          {showFloatingWidget && (
            <AndroidWidgetSimulator 
              floating 
              onClose={() => setShowFloatingWidget(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <ProviderProvider>
        <AudioProvider>
          <AppContent />
        </AudioProvider>
      </ProviderProvider>
    </LibraryProvider>
  );
}

