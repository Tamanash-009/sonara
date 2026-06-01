import { Settings as SettingsIcon, Shield, Sliders, Globe, Volume2, Database, Download, Upload, Info, RefreshCw, Trash2, Heart, Music, LayoutList, Check, User, Sparkles } from 'lucide-react';
import { useLibrary } from '../contexts/LibraryContext';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function SettingsView() {
  const { tracks, playlists, scanDirectory, loadDemoLibrary, importSettings, setImportSettings, rescanLibrary, userName, setUserName, theme, setTheme, clearAllData } = useLibrary();
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'library' | 'ui' | 'about'>('profile');

  const stats = {
    tracks: tracks.length,
    playlists: playlists.length,
    favorites: tracks.filter(t => t.isFavorite).length,
    history: tracks.filter(t => t.lastPlayed).length,
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'library', label: 'Library', icon: Database },
    { id: 'ui', label: 'Appearance', icon: Sliders },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  const exportData = () => {
    const data = {
      playlists,
      favorites: tracks.filter(t => t.isFavorite).map(t => ({
        title: t.title,
        artist: t.artist,
        album: t.album,
        path: t.path
      })),
      settings: importSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonara-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-24">
      <header className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tightest uppercase italic text-white/90">Settings</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuration & Preferences</p>
        </div>
        <div className="p-4 bg-white/5 rounded-3xl border border-white/10 text-brand-primary shadow-xl">
          <SettingsIcon size={28} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all border border-transparent mb-1",
                activeTab === item.id 
                  ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="glass border border-white/5 rounded-[2.5rem] p-6 sm:p-10 space-y-12 backdrop-blur-3xl mx-2">
          {activeTab === 'profile' && (
            <section className="space-y-10">
              <div className="flex flex-col items-center text-center gap-6 py-4">
                <div className="w-32 h-32 rounded-full glass border-4 border-brand-primary/20 flex items-center justify-center text-brand-primary text-5xl font-black italic shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden group">
                   {userName?.charAt(0).toUpperCase() || 'V'}
                   <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase italic tracking-tightest">{userName || 'Voyager'}</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Standard Identity Profile</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Display Preferences</h3>
                <div className="grid gap-4">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
                        <input 
                          type="text" 
                          value={userName || ''} 
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="What's your name?"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold tracking-tight text-white focus:border-brand-primary outline-none transition-all shadow-inner"
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Achievements</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2">
                   <AchievementBadge icon={Music} label="Collector" progress={Math.min(100, (tracks.length / 100) * 100)} />
                   <AchievementBadge icon={Heart} label="Curator" progress={Math.min(100, (tracks.filter(t => t.isFavorite).length / 20) * 100)} />
                   <AchievementBadge icon={Sparkles} label="Engine Pro" progress={100} />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'general' && (
            <section className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Import Behavior</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Duplicate Action</h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">How to handle existing tracks on import</p>
                    </div>
                    <select 
                      value={importSettings.duplicateAction}
                      onChange={(e) => setImportSettings({ duplicateAction: e.target.value as any })}
                      className="bg-black text-[10px] font-black uppercase tracking-widest p-2 px-4 rounded-xl border border-white/10 focus:ring-1 focus:ring-brand-primary outline-none"
                    >
                      <option value="skip">Skip Existing</option>
                      <option value="keep">Keep Both</option>
                      <option value="merge">Merge Metadata</option>
                    </select>
                  </div>
                  <SettingToggle 
                    label="Auto-Favorite" 
                    description="Automatically heart tracks with 5-star ratings in metadata" 
                    checked={importSettings.autoFavorite}
                    onChange={(checked) => setImportSettings({ autoFavorite: checked })}
                  />
                  <SettingToggle 
                    label="Extract Lyrics" 
                    description="Try to read lyrics from file tags during scan" 
                    checked={importSettings.extractLyrics}
                    onChange={(checked) => setImportSettings({ extractLyrics: checked })}
                  />
                  <SettingToggle 
                    label="AI Neural Enrichment" 
                    description="Fetch synced lyrics, artist data & album art using Gemini Neural Engine" 
                    checked={importSettings.aiEnrichment}
                    onChange={(checked) => setImportSettings({ aiEnrichment: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Lyrics Preferences</h3>
                <div className="grid gap-4">
                  <SettingSelect 
                    label="Lyrics Provider" 
                    description="Priority source for track lyrics" 
                    options={['LRCLIB (Recommended)', 'Genius', 'Musixmatch', 'Local Tags Only']} 
                    defaultValue="LRCLIB (Recommended)"
                  />
                  <SettingToggle label="Timeline Sync" description="Auto-scroll to current playback position" defaultChecked />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'library' && (
            <section className="space-y-10">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Music} label="Tracks" value={stats.tracks} />
                <StatCard icon={LayoutList} label="Playlists" value={stats.playlists} />
                <StatCard icon={Heart} label="Favorites" value={stats.favorites} />
                <StatCard icon={RefreshCw} label="History" value={stats.history} />
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Library Maintenance</h3>
                <div className="grid gap-4">
                   <SettingAction 
                    label="Rescan Local Library" 
                    description="Update metadata and find new files in your main directory"
                    icon={RefreshCw}
                    onClick={rescanLibrary}
                  />
                  <SettingAction 
                    label="Export Library" 
                    description="Save a portability backup of your playlists and hearts"
                    icon={Download}
                    onClick={exportData}
                  />
                  <SettingAction 
                    label="Wipe All Data" 
                    description="Permanently reset library, themes, and cache"
                    icon={Trash2}
                    variant="danger"
                    onClick={() => {
                      if (confirm('CRITICAL ACTION: This will erase all your playlists, library metadata, and cached data. Audio files on your device will NOT be touched. Proceed?')) {
                        clearAllData();
                      }
                    }}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'ui' && (
            <section className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">App Aesthetic</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  <ThemeOption label="Cyan" color="#22d3ee" active={theme === 'cyan'} onClick={() => setTheme('cyan')} />
                  <ThemeOption label="Deep Sea" color="#3b82f6" active={theme === 'deepsea'} onClick={() => setTheme('deepsea')} />
                  <ThemeOption label="Vaporwave" color="#f472b6" active={theme === 'vaporwave'} onClick={() => setTheme('vaporwave')} />
                  <ThemeOption label="Emerald" color="#10b981" active={theme === 'emerald'} onClick={() => setTheme('emerald')} />
                  <ThemeOption label="Amber" color="#f59e0b" active={theme === 'amber'} onClick={() => setTheme('amber')} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[.3em] ml-2">Layout & Motion</h3>
                <div className="grid gap-4">
                  <SettingToggle label="Ultra Blur" description="Enhanced glassmorphism (Performance intensive)" defaultChecked />
                  <SettingToggle label="Dense Listing" description="Fit more tracks into the screen view" />
                  <SettingToggle label="Haptic Feedback" description="Vibrate on mobile touch actions" defaultChecked />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'about' && (
            <section className="space-y-8 text-center py-6">
              <div className="w-28 h-28 bg-brand-primary rounded-[2.5rem] flex items-center justify-center m-auto shadow-3xl relative transform rotate-6 hover:rotate-0 transition-transform duration-500 group">
                 <Music size={56} className="text-black group-hover:scale-110 transition-transform" />
                 <div className="absolute -bottom-2 -right-2 bg-black text-brand-primary text-[8px] font-black px-3 py-1.5 rounded-full border border-brand-primary/30 shadow-xl uppercase tracking-widest">v1.2.5</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase italic tracking-tightest leading-none">Sonara Engine Pro</h3>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  The ultimate local-first audio player for high-performance music management.
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 pt-12">
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors">Safety</a>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors">Privacy</a>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors">License</a>
              </div>
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest pt-8">© 2026 Tamanash Chakraborty. All rights reserved.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange, defaultChecked = false }: { label: string, description: string, checked?: boolean, onChange?: (c: boolean) => void, defaultChecked?: boolean }) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (onChange) onChange(!isChecked);
    else setInternalChecked(!isChecked);
  };

  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group cursor-pointer" onClick={handleToggle}>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{label}</h4>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{description}</p>
      </div>
      <button 
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-500 flex items-center px-1",
          isChecked ? "bg-brand-primary shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "bg-slate-800"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full transition-all duration-500 shadow-xl",
          isChecked ? "translate-x-6 bg-black" : "translate-x-0 bg-slate-500"
        )} />
      </button>
    </div>
  );
}

function SettingSelect({ label, description, options, defaultValue }: { label: string, description: string, options: string[], defaultValue: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="space-y-1 pr-4">
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{label}</h4>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{description}</p>
      </div>
      <select className="bg-black text-[10px] font-black uppercase tracking-widest p-2 px-4 rounded-xl border border-white/10 focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer hover:border-white/30 transition-colors">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function SettingAction({ label, description, icon: Icon, onClick, variant = 'default' }: { label: string, description: string, icon: any, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-5 rounded-3xl border transition-all text-left group",
        variant === 'danger' 
          ? "bg-red-500/5 border-red-500/10 hover:border-red-500/30 text-red-500" 
          : "bg-white/5 border-white/5 hover:border-white/10"
      )}
    >
      <div className="space-y-1">
        <h4 className={cn("text-[10px] font-black uppercase tracking-widest", variant === 'danger' ? "text-red-500" : "text-white")}>{label}</h4>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{description}</p>
      </div>
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
        variant === 'danger' ? "bg-red-500/10" : "bg-white/5 group-hover:bg-brand-primary group-hover:text-black"
      )}>
        <Icon size={20} />
      </div>
    </button>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center space-y-2 group hover:border-brand-primary/20 transition-all shadow-xl hover:-translate-y-1 duration-300">
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-500 group-hover:text-brand-primary transition-colors">
        <Icon size={20} />
      </div>
      <div className="text-2xl font-black italic uppercase text-white leading-none">{value}</div>
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function AchievementBadge({ icon: Icon, label, progress }: { icon: any, label: string, progress: number }) {
  return (
    <div className="flex-shrink-0 w-32 p-4 bg-white/5 rounded-3xl border border-white/5 space-y-3">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center m-auto transition-all",
        progress === 100 ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]" : "bg-white/5 text-slate-600"
      )}>
        <Icon size={24} />
      </div>
      <div className="text-center space-y-1">
        <div className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ThemeOption({ label, color, active = false, onClick }: { label: string, color: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "aspect-video rounded-3xl border p-4 flex flex-col justify-end transition-all relative overflow-hidden group shadow-xl",
        active ? "border-brand-primary bg-white/5" : "border-white/5 bg-white/5 hover:border-white/20"
      )}
    >
      <div 
        className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white/20" 
        style={{ backgroundColor: color }}
      />
      {active && (
        <div className="absolute inset-0 bg-brand-primary opacity-5" />
      )}
      <span className={cn("relative z-10 text-[10px] font-black uppercase tracking-widest", active ? "text-brand-primary" : "text-slate-500")}>
        {label}
      </span>
    </button>
  );
}

