import React from 'react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f141a] text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full glass border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/docs/assets/logo.png" alt="Sonara" className="h-10 w-10 object-cover rounded-xl" />
            <span className="text-xl font-bold tracking-widest uppercase">Sonara</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
          </nav>
          <a href="#download" className="bg-brand-primary text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Download APK
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Premium <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">Audio Engine</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              A strict offline-first music player built with Material You, Kotlin, and Media3. Take back ownership of your local library.
            </p>
            <div className="flex gap-4">
              <a href="#download" className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors">
                Get for Android
              </a>
              <a href="https://github.com/yourusername/sonara" target="_blank" rel="noreferrer" className="glass border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-colors">
                View GitHub
              </a>
            </div>
          </div>
          <div className="relative flex justify-center">
             <img src="/docs/assets/social_preview.png" alt="App Preview" className="w-full max-w-md rounded-[2.5rem] shadow-2xl border-4 border-white/10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black/40 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Core Features</h2>
            <p className="text-slate-400 text-lg">Engineered for the ultimate offline listening experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Material You", desc: "Dynamic theming that adapts perfectly to your wallpaper." },
              { title: "High Fidelity", desc: "Advanced ExoPlayer Media3 integration with FLAC and ALAC support." },
              { title: "Privacy First", desc: "Zero tracking, zero analytics. Your library stays on your device." }
            ].map(f => (
              <div key={f.title} className="glass p-8 rounded-3xl border border-white/5 hover:border-brand-primary/30 transition-colors">
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-center">Interface</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
            {['home_screen', 'library', 'now_playing', 'equalizer', 'settings'].map(shot => (
              <img key={shot} src={`/docs/screenshots/${shot}.png`} alt={shot} className="h-96 w-auto rounded-3xl snap-center shadow-xl border border-white/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 bg-brand-primary/5 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Modern Stack</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sonara is architected using the bleeding edge of Android development. Fully reactive UI with Jetpack Compose, robust Dependency Injection with Dagger Hilt, and safe multi-threading via Kotlin Coroutines.
            </p>
            <ul className="space-y-3 font-medium text-slate-300">
              <li>? Clean Architecture & MVVM</li>
              <li>? Room Database for local state</li>
              <li>? WorkManager for sync routines</li>
              <li>? Play Integrity & SSL Pinning</li>
            </ul>
          </div>
          <div className="glass p-8 rounded-3xl border border-brand-primary/20">
             <img src="/docs/assets/github_banner.png" alt="Architecture" className="w-full h-auto rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Documentation & Download */}
      <section id="docs" className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 glass p-12 rounded-[3rem] border border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent pointer-events-none" />
           <h2 className="text-4xl font-black uppercase relative z-10">Ready to listen?</h2>
           <div id="download" className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <a href="/release/sonara-release.apk" className="bg-brand-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                Download APK v1.0.0
              </a>
              <a href="https://github.com/yourusername/sonara/tree/main/docs" target="_blank" rel="noreferrer" className="glass border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                Read Documentation
              </a>
           </div>
        </div>
      </section>
      
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5">
        � 2026 Sonara Music. Built with Material 3.
      </footer>
    </div>
  );
}

