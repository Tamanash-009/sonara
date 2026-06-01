/**
 * @license
 * © 2026 Tamanash Chakraborty. All rights reserved.
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { Howl, Howler } from 'howler';
import { Track, PlayerState, EQSettings } from '../types';
import { generateId } from '../lib/utils';
import { useLibrary } from './LibraryContext';
import { useProviders } from './ProviderContext';
 
export const EQ_BANDS = [60, 230, 910, 3600, 14000];

export const EQ_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 0, 0, 0],
  'Rock': [4, 2, -1, 2, 4],
  'Pop': [-1, 2, 5, 1, -2],
  'Classical': [5, 3, -2, 4, 4],
  'Jazz': [4, 2, 1, 2, -2],
  'Electronic': [5, 3, 0, 2, 4],
};

interface AudioContextType extends PlayerState {
  playTrack: (track: Track, fromQueue?: boolean) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  setShuffle: (shuffle: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[]) => void;
  moveQueueTrack: (fromIndex: number, toIndex: number) => void;
  setEQBand: (index: number, gain: number) => void;
  toggleEQ: () => void;
  applyPreset: (presetName: string) => void;
  setSaveEQPerTrack: (enabled: boolean) => void;
  setSleepTimer: (seconds: number | null) => void;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    originalQueue: [],
    history: [],
    volume: 0.8,
    muted: false,
    repeatMode: 'none',
    shuffle: false,
    progress: 0,
    isBuffering: false,
    playbackError: null,
    eq: {
      enabled: true,
      preset: 'Flat',
      bands: EQ_BANDS.map(f => ({ frequency: f, gain: 0 }))
    },
    saveEQPerTrack: false,
    sleepTimer: {
      remainingSeconds: null,
      totalSeconds: null
    }
  });

  const stateRef = useRef<PlayerState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setupHowlRef = useRef<((howl: Howl) => Howl) | null>(null);

  const howlRef = useRef<Howl | null>(null);
  const nextHowlRef = useRef<Howl | null>(null);
  const preloadedTrackIdRef = useRef<string | null>(null);
  const progressInterval = useRef<number | null>(null);
  const sleepTimerInterval = useRef<number | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Initialize filters when context becomes available
  const initEQ = useCallback(() => {
    const ctx = Howler.ctx;
    if (!ctx || filtersRef.current.length > 0) return;

    try {
      Howler.autoUnlock = true;
      if (ctx.state === 'suspended') ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const filters = EQ_BANDS.map(freq => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });

      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(analyser);
      
      const target = (Howler as any).masterGain || ctx.destination;
      analyser.connect(target);
      
      filtersRef.current = filters;

      state.eq.bands.forEach((band, i) => {
        if (filters[i]) filters[i].gain.value = state.eq.enabled ? band.gain : 0;
      });
      
      console.log('Audio EQ & Analyser Initialized');
    } catch (e) {
      console.error('Failed to initialize EQ:', e);
    }
  }, [state.eq.enabled, state.eq.bands]);

  const clearHowl = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
    if (nextHowlRef.current) {
      nextHowlRef.current.unload();
      nextHowlRef.current = null;
    }
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const playNext = useCallback(() => {
    setState(prev => {
      let nextTrack: Track | null = null;
      let newQueue = [...prev.queue];
      let newHistory = prev.currentTrack ? [...prev.history, prev.currentTrack] : prev.history;

      if (prev.queue.length > 0) {
        nextTrack = prev.queue[0];
        newQueue = prev.queue.slice(1);
      } else if (prev.repeatMode === 'all' && newHistory.length > 0) {
        // Repeat all: rebuild queue from history and start over
        const fullList = [...newHistory];
        nextTrack = fullList[0];
        newQueue = fullList.slice(1);
        newHistory = [];
      }

      if (nextTrack) {
        return { ...prev, currentTrack: nextTrack, queue: newQueue, history: newHistory, progress: 0, isPlaying: true };
      }
      
      return { ...prev, isPlaying: false, progress: 0 };
    });
  }, []);

  const playPrevious = useCallback(() => {
    setState(prev => {
      // If we are more than 3 seconds into the track, just restart it
      const currentProgressTime = (prev.progress / 100) * (howlRef.current?.duration() || 0);
      if (currentProgressTime > 3) {
        if (howlRef.current) howlRef.current.seek(0);
        return { ...prev, progress: 0 };
      }

      if (prev.history.length === 0) {
        // If at start and repeat all is on, go to last track?
        if (prev.repeatMode === 'all' && prev.queue.length > 0) {
           const fullList = [...prev.queue, ...(prev.currentTrack ? [prev.currentTrack] : [])];
           const lastTrack = fullList[fullList.length - 1];
           return { ...prev, currentTrack: lastTrack, history: fullList.slice(0, -1), queue: [], progress: 0, isPlaying: true };
        }
        return prev;
      }

      const prevTrack = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      const newQueue = prev.currentTrack ? [prev.currentTrack, ...prev.queue] : prev.queue;
      return { ...prev, currentTrack: prevTrack, history: newHistory, queue: newQueue, progress: 0, isPlaying: true };
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!howlRef.current) return;
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
    if (howlRef.current.playing()) {
      howlRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      howlRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const seek = useCallback((progress: number) => {
    if (!howlRef.current) return;
    const duration = howlRef.current.duration();
    if (duration > 0) {
      const time = (progress / 100) * duration;
      howlRef.current.seek(time);
      setState(prev => ({ ...prev, progress }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
    setState(prev => ({ ...prev, volume }));
  }, []);

  const { recordPlay, tracks, isLoading: libraryLoading } = useLibrary();
  const { resolveStream } = useProviders();
  const [isRestored, setIsRestored] = useState(false);

  const preloadNextTrack = useCallback(async () => {
    const currentState = stateRef.current;
    if (currentState.queue.length === 0 || nextHowlRef.current) return;

    const nextTrack = currentState.queue[0];
    console.log(`[Sonara-Engine] Preloading Next Track: ${nextTrack.title}`);
    
    try {
      const resolved = await resolveStream(nextTrack);
      const nextHowl = new Howl({
        src: [resolved.url],
        format: resolved.format ? [resolved.format] : ['mp3'],
        html5: true,
        volume: currentState.volume,
        preload: true,
        onload: () => {
          console.log(`[Sonara-Engine] Next Track Preloaded: ${nextTrack.title}`);
          preloadedTrackIdRef.current = nextTrack.id;
        }
      });
      nextHowlRef.current = nextHowl;
    } catch (e) {
      console.warn('[Sonara-Engine] Preload failed:', e);
    }
  }, [resolveStream]);

  const handleGaplessTransitionToNext = useCallback(() => {
    const currentState = stateRef.current;
    
    if (currentState.queue.length > 0) {
      const nextTrack = currentState.queue[0];
      const preloadedHowl = nextHowlRef.current;
      const preloadedTrackId = preloadedTrackIdRef.current;

      if (preloadedHowl && preloadedTrackId === nextTrack.id) {
        console.log(`[Sonara-Engine] Seamless gapless transition to: ${nextTrack.title}`);
        
        // 1. Unload current track
        if (howlRef.current) {
          howlRef.current.stop();
          howlRef.current.unload();
          howlRef.current = null;
        }
        if (progressInterval.current) {
          window.clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        // 2. Swapping the active Howl to preloaded instance
        howlRef.current = preloadedHowl;
        loadedTrackIdRef.current = nextTrack.id;
        
        // 3. Clear preloaded refs so they don't get double-freed
        nextHowlRef.current = null;
        preloadedTrackIdRef.current = null;

        // 4. Attach event listeners
        if (setupHowlRef.current) {
          setupHowlRef.current(preloadedHowl);
        }

        // 5. Play immediately
        preloadedHowl.play();

        // 6. Record metric
        recordPlay(nextTrack.id);

        // 7. MediaSession
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: nextTrack.title, 
            artist: nextTrack.artist, 
            album: nextTrack.album,
            artwork: [
              { src: nextTrack.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=512&h=512&q=80', sizes: '512x512', type: 'image/jpeg' }
            ]
          });
        }

        // 8. Update state
        setState(prev => {
          const newQueue = prev.queue.slice(1);
          const newHistory = prev.currentTrack ? [...prev.history, prev.currentTrack] : prev.history;
          return {
            ...prev,
            currentTrack: nextTrack,
            queue: newQueue,
            history: newHistory,
            progress: 0,
            isPlaying: true,
            isBuffering: false
          };
        });

        return;
      }
    }

    // Fallback normal transition
    playNext();
  }, [playNext, recordPlay]);

  const setupHowl = useCallback((howl: Howl) => {
    howl.off();

    howl.on('play', () => {
        console.log(`[Sonara-Engine] Playback Started: Event_Play`);
        setState(prev => ({ ...prev, isPlaying: true, isBuffering: false }));
        if (progressInterval.current) window.clearInterval(progressInterval.current);
        progressInterval.current = window.setInterval(() => {
          if (howlRef.current) {
            const seekVal = howlRef.current.seek() as number;
            const duration = howlRef.current.duration();
            if (duration > 0) {
              setState(prev => ({ ...prev, progress: (seekVal / duration) * 100 }));
            }
          }
        }, 1000);

        setTimeout(preloadNextTrack, 5000);
    });

    howl.on('pause', () => {
        console.log(`[Sonara-Engine] Playback Paused: Event_Pause`);
        setState(prev => ({ ...prev, isPlaying: false }));
    });

    howl.on('stop', () => {
        console.log(`[Sonara-Engine] Playback Stopped: Event_Stop`);
        setState(prev => ({ ...prev, isPlaying: false, isBuffering: false }));
    });

    howl.on('end', () => {
        console.log(`[Sonara-Engine] Stream Depleted: Event_End`);
        const { repeatMode } = stateRef.current;
        if (repeatMode === 'one') {
          if (howlRef.current) {
            howlRef.current.seek(0);
            howlRef.current.play();
          }
        } else {
          handleGaplessTransitionToNext();
        }
    });

    howl.on('load', () => {
        console.log(`[Sonara-Engine] Source Loaded (MediaItem Prepared)`);
        setState(prev => ({ ...prev, isBuffering: false }));
    });

    howl.on('loaderror', (id, err) => {
        console.error(`[Sonara-Engine] Load Error [ID: ${id}]:`, err);
        const errorMsg = typeof err === 'number' ? `Decoding failed (Error Code: ${err})` : String(err);
        setState(prev => ({ ...prev, isBuffering: false, playbackError: errorMsg }));
        setTimeout(playNext, 2000);
    });

    howl.on('playerror', (id, err) => {
        console.error(`[Sonara-Engine] Playback Exception:`, err);
        howl.once('unlock', () => {
          console.log(`[Sonara-Engine] Audio Context Restored - Retrying Playback`);
          howl.play();
        });
        setState(prev => ({ ...prev, isBuffering: false, playbackError: `Playback Restricted: ${err}` }));
    });

    return howl;
  }, [preloadNextTrack, playNext, handleGaplessTransitionToNext]);

  useEffect(() => {
    setupHowlRef.current = setupHowl;
  }, [setupHowl]);

  // Restore state from localStorage
  useEffect(() => {
    if (libraryLoading || isRestored) return;

    const savedState = localStorage.getItem('sonara_player_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        
        // Resolve tracks from IDs
        const currentTrack = tracks.find(t => t.id === parsed.currentTrackId) || null;
        const queue = (parsed.queueIds as string[] || []).map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[];
        const originalQueue = (parsed.originalQueueIds as string[] || []).map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[];
        const history = (parsed.historyIds as string[] || []).map(id => tracks.find(t => t.id === id)).filter(Boolean) as Track[];

        // Retrieve saved global or per-track EQ
        let eqSettings = {
          enabled: true,
          preset: 'Flat',
          bands: EQ_BANDS.map(f => ({ frequency: f, gain: 0 }))
        };

        const saveEQPerTrack = parsed.saveEQPerTrack ?? false;

        if (saveEQPerTrack && currentTrack) {
          const storedPerTrack = localStorage.getItem('sonara_per_track_eq');
          if (storedPerTrack) {
            const perTrackParsed = JSON.parse(storedPerTrack);
            if (perTrackParsed[currentTrack.id]) {
              eqSettings = perTrackParsed[currentTrack.id];
            }
          }
        } else {
          const storedGlobal = localStorage.getItem('sonara_global_eq');
          if (storedGlobal) {
            eqSettings = JSON.parse(storedGlobal);
          }
        }

        setState(prev => ({
          ...prev,
          currentTrack,
          queue,
          originalQueue: originalQueue.length > 0 ? originalQueue : queue,
          history,
          volume: parsed.volume ?? 0.8,
          repeatMode: parsed.repeatMode ?? 'none',
          shuffle: parsed.shuffle ?? false,
          progress: parsed.progress ?? 0,
          saveEQPerTrack,
          eq: eqSettings
        }));

        // If there was a track playing, load it (but don't autoplay)
        if (currentTrack) {
          loadTrack(currentTrack, parsed.progress ?? 0);
        }
      } catch (e) {
        console.error("Failed to restore player state", e);
      }
    }
    setIsRestored(true);
  }, [libraryLoading, tracks, isRestored]);

  // Save state to localStorage
  useEffect(() => {
    if (!isRestored) return;

    const stateToSave = {
      currentTrackId: state.currentTrack?.id,
      queueIds: state.queue.map(t => t.id),
      originalQueueIds: state.originalQueue.map(t => t.id),
      historyIds: state.history.map(t => t.id),
      volume: state.volume,
      repeatMode: state.repeatMode,
      shuffle: state.shuffle,
      progress: state.progress,
      saveEQPerTrack: state.saveEQPerTrack
    };
    localStorage.setItem('sonara_player_state', JSON.stringify(stateToSave));
  }, [state, isRestored]);

  // Handle active/realtime EQ writes whenever eq configs or save mode changes
  useEffect(() => {
    if (!isRestored) return;

    const isPerTrack = state.saveEQPerTrack;
    const currentTrackId = state.currentTrack?.id;

    if (isPerTrack && currentTrackId) {
      const storedPerTrack = localStorage.getItem('sonara_per_track_eq');
      let parsed: Record<string, typeof state.eq> = {};
      if (storedPerTrack) {
        try {
          parsed = JSON.parse(storedPerTrack);
        } catch (e) {}
      }
      parsed[currentTrackId] = state.eq;
      localStorage.setItem('sonara_per_track_eq', JSON.stringify(parsed));
    } else {
      localStorage.setItem('sonara_global_eq', JSON.stringify(state.eq));
    }
  }, [state.eq, state.saveEQPerTrack, state.currentTrack?.id, isRestored]);

  const loadTrack = useCallback(async (track: Track, startProgress: number = 0, autoPlay: boolean = false) => {
    let preloadedHowl: Howl | null = null;
    if (nextHowlRef.current && preloadedTrackIdRef.current === track.id) {
      console.log(`[Sonara-Engine] Using Preloaded Buffer for Gapless Playback: ${track.title}`);
      preloadedHowl = nextHowlRef.current;
      nextHowlRef.current = null;
      preloadedTrackIdRef.current = null;
    }

    clearHowl();
    if (filtersRef.current.length === 0) initEQ();

    // Check for saved EQ settings (per track or global fallback)
    let eqToUse = stateRef.current.eq;
    if (stateRef.current.saveEQPerTrack) {
      const storedPerTrack = localStorage.getItem('sonara_per_track_eq');
      if (storedPerTrack) {
        try {
          const parsed = JSON.parse(storedPerTrack);
          if (parsed[track.id]) {
            eqToUse = parsed[track.id];
          } else {
            // Apply a default global EQ if not saved specifically for this track yet
            const storedGlobal = localStorage.getItem('sonara_global_eq');
            if (storedGlobal) {
              eqToUse = JSON.parse(storedGlobal);
            }
          }
        } catch (e) {}
      }
    } else {
      const storedGlobal = localStorage.getItem('sonara_global_eq');
      if (storedGlobal) {
        try {
          eqToUse = JSON.parse(storedGlobal);
        } catch (e) {}
      }
    }

    // Apply any restored EQ settings to active biquad filters
    if (filtersRef.current.length > 0) {
      filtersRef.current.forEach((filter, i) => {
        if (eqToUse.bands[i]) {
          filter.gain.value = eqToUse.enabled ? eqToUse.bands[i].gain : 0;
        }
      });
    }

    console.log(`[Sonara-Engine] Preparing MediaItem: ${track.title} [ID: ${track.id}]`);
    setState(prev => ({ 
      ...prev, 
      currentTrack: track, 
      isBuffering: !preloadedHowl, 
      playbackError: null,
      eq: eqToUse
    }));

    try {
      if (preloadedHowl) {
        howlRef.current = setupHowl(preloadedHowl);
        if (autoPlay) preloadedHowl.play();
      } else {
        // 1. PROVIDER STREAM RESOLUTION
        console.log(`[Sonara-Engine] Phase 1: Resolving Neural Stream via Provider...`);
        const resolved = await resolveStream(track);
        const { url: src, format } = resolved;

        // 2. PROTOCOL VALIDATION & SOURCE BINDING
        console.log(`[Sonara-Engine] Phase 2: Source Binding -> ${src} [Format: ${format}]`);
        
        const howl = new Howl({
          src: [src],
          format: format ? [format] : ['mp3'],
          html5: true,
          volume: stateRef.current.volume,
          preload: true,
        });

        howlRef.current = setupHowl(howl);
        if (autoPlay) {
          howl.play();
        }
      }

      // 4. MEDIA SESSION INTEGRATION
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title, 
          artist: track.artist, 
          album: track.album,
          artwork: [
            { src: track.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=512&h=512&q=80', sizes: '512x512', type: 'image/jpeg' }
          ]
        });
        
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime) {
            const duration = howlRef.current?.duration() || 0;
            if (duration > 0) seek((details.seekTime / duration) * 100);
          }
        });
      }
    } catch (error) {
      console.error('[Sonara-Engine] Critical failure in MediaItem resolution:', error);
      setState(prev => ({ ...prev, isBuffering: false, playbackError: 'Cloud Discovery Failed' }));
    }
  }, [clearHowl, initEQ, playNext, playPrevious, resolveStream, seek, setupHowl, togglePlay]);

  const playTrack = useCallback((track: Track, fromQueue: boolean = false) => {
    loadTrack(track, 0, true);
    recordPlay(track.id);
    
    setState(prev => ({ 
      ...prev, isPlaying: true, progress: 0,
      history: !fromQueue && prev.currentTrack ? [...prev.history, prev.currentTrack] : prev.history
    }));
  }, [loadTrack, recordPlay]);

  const setEQBand = useCallback((index: number, gain: number) => {
    if (filtersRef.current[index]) {
      filtersRef.current[index].gain.value = state.eq.enabled ? gain : 0;
    }
    setState(prev => ({
      ...prev,
      eq: {
        ...prev.eq,
        preset: 'Manual',
        bands: prev.eq.bands.map((b, i) => i === index ? { ...b, gain } : b)
      }
    }));
  }, [state.eq.enabled]);

  const toggleEQ = useCallback(() => {
    const nextEnabled = !state.eq.enabled;
    filtersRef.current.forEach((f, i) => {
      f.gain.value = nextEnabled ? state.eq.bands[i].gain : 0;
    });
    setState(prev => ({ ...prev, eq: { ...prev.eq, enabled: nextEnabled } }));
  }, [state.eq.bands, state.eq.enabled]);

  const applyPreset = useCallback((presetName: string) => {
    const gains = EQ_PRESETS[presetName];
    if (!gains) return;

    gains.forEach((gain, i) => {
      if (filtersRef.current[i]) filtersRef.current[i].gain.value = state.eq.enabled ? gain : 0;
    });

    setState(prev => ({
      ...prev,
      eq: {
        ...prev.eq,
        preset: presetName,
        bands: prev.eq.bands.map((b, i) => ({ ...b, gain: gains[i] }))
      }
    }));
  }, [state.eq.enabled]);

  const setSleepTimer = useCallback((seconds: number | null) => {
    if (sleepTimerInterval.current) {
      window.clearInterval(sleepTimerInterval.current);
      sleepTimerInterval.current = null;
    }

    if (seconds === null) {
      setState(prev => ({ 
        ...prev, 
        sleepTimer: { remainingSeconds: null, totalSeconds: null } 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      sleepTimer: { remainingSeconds: seconds, totalSeconds: seconds } 
    }));

    sleepTimerInterval.current = window.setInterval(() => {
      setState(prev => {
        if (prev.sleepTimer.remainingSeconds === null) return prev;
        
        const remaining = prev.sleepTimer.remainingSeconds - 1;
        if (remaining <= 0) {
          if (sleepTimerInterval.current) {
            window.clearInterval(sleepTimerInterval.current);
            sleepTimerInterval.current = null;
          }
          
          // Trigger stop
          if (howlRef.current && howlRef.current.playing()) {
             howlRef.current.pause();
          }
          
          return {
            ...prev,
            isPlaying: false,
            sleepTimer: { remainingSeconds: 0, totalSeconds: prev.sleepTimer.totalSeconds }
          };
        }
        
        return {
          ...prev,
          sleepTimer: { ...prev.sleepTimer, remainingSeconds: remaining }
        };
      });
    }, 1000);
  }, []);

  const setRepeatMode = (mode: 'none' | 'one' | 'all') => setState(prev => ({ ...prev, repeatMode: mode }));
  const setSaveEQPerTrack = (enabled: boolean) => setState(prev => ({ ...prev, saveEQPerTrack: enabled }));
  
  const setShuffle = (shuffle: boolean) => {
    setState(prev => {
      if (shuffle === prev.shuffle) return prev;
      
      if (shuffle) {
        // Toggle ON: Store current order and shuffle queue
        const currentQueue = [...prev.queue];
        const shuffled = [...currentQueue].sort(() => Math.random() - 0.5);
        return {
          ...prev,
          shuffle: true,
          originalQueue: currentQueue,
          queue: shuffled
        };
      } else {
        // Toggle OFF: Restore order from originalQueue
        // Filter out tracks that are already in history or is the current track
        const playedIds = new Set(prev.history.map(t => t.id));
        if (prev.currentTrack) playedIds.add(prev.currentTrack.id);
        
        const remainingOriginal = prev.originalQueue.filter(t => !playedIds.has(t.id));

        return {
          ...prev,
          shuffle: false,
          queue: remainingOriginal
        };
      }
    });
  };
  
  const addToQueue = (track: Track) => setState(prev => {
    const newQueue = [...prev.queue, track];
    const newOriginal = [...prev.originalQueue, track];
    return { ...prev, queue: newQueue, originalQueue: newOriginal };
  });

  const removeFromQueue = (trackId: string) => setState(prev => ({ 
    ...prev, 
    queue: prev.queue.filter(t => t.id !== trackId),
    originalQueue: prev.originalQueue.filter(t => t.id !== trackId)
  }));

  const clearQueue = () => setState(prev => ({ ...prev, queue: [], originalQueue: [] }));
  
  const setQueue = (tracks: Track[]) => setState(prev => ({ 
    ...prev, 
    queue: prev.shuffle ? [...tracks].sort(() => Math.random() - 0.5) : tracks,
    originalQueue: tracks 
  }));

  const moveQueueTrack = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);
      
      // If shuffle is off, this should probably update originalQueue too
      let newOriginal = [...prev.originalQueue];
      if (!prev.shuffle) {
        newOriginal = [...newQueue];
      }
      
      return { ...prev, queue: newQueue, originalQueue: newOriginal };
    });
  };

  useEffect(() => {
    if (!state.currentTrack || !isRestored) return;
    
    if (loadedTrackIdRef.current !== state.currentTrack.id) {
       loadedTrackIdRef.current = state.currentTrack.id;
       loadTrack(state.currentTrack, state.progress, state.isPlaying);
    } else if (howlRef.current) {
       // Sync play/pause state if track is the same
       if (state.isPlaying && !howlRef.current.playing()) {
         howlRef.current.play();
       } else if (!state.isPlaying && howlRef.current.playing()) {
         howlRef.current.pause();
       }
    }
  }, [state.currentTrack?.id, isRestored, loadTrack, state.isPlaying]);

  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            playPrevious();
          }
          break;
        case 'KeyS':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setShuffle(!state.shuffle);
          }
          break;
        case 'KeyR':
          if ((e.metaKey || e.ctrlKey) && e.altKey) {
            e.preventDefault();
            const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
            const currentIndex = modes.indexOf(state.repeatMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setRepeatMode(nextMode);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
      clearHowl();
    };
  }, [state.isPlaying, state.shuffle, state.repeatMode, togglePlay, playNext, playPrevious]);

  useEffect(() => {
    if (state.currentTrack) {
      document.title = `\u25B6 ${state.currentTrack.title} • ${state.currentTrack.artist} | Sonara`;
    } else {
      document.title = 'Sonara | Premium Audio Engine';
    }
  }, [state.currentTrack]);

  return (
    <AudioContext.Provider value={{
      ...state,
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seek,
      setVolume,
      setRepeatMode,
      setShuffle,
      addToQueue,
      removeFromQueue,
      clearQueue,
      setQueue,
      moveQueueTrack,
      setEQBand,
      toggleEQ,
      applyPreset,
      setSaveEQPerTrack,
      setSleepTimer,
      analyserRef
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
