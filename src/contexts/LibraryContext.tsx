/**
 * @license
 * © 2026 Tamanash Chakraborty. All rights reserved.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useCallback } from 'react';
import * as mm from 'music-metadata-browser';
import { Track, Playlist, ScanProgress } from '../types';
import { generateId } from '../lib/utils';
import { db, saveTracks, getAllTracks, deleteTracksFromDB, savePlaylist, getAllPlaylists, saveSetting, getSetting } from '../services/db';
import { fetchMetadataForTrack } from '../services/metadataService';

interface LibraryContextType {
  tracks: Track[];
  playlists: Playlist[];
  smartPlaylists: { id: string; name: string; tracks: Track[] }[];
  userName: string | null;
  isOnboarded: boolean;
  isLoading: boolean;
  scanProgress: ScanProgress;
  importSettings: {
    duplicateAction: 'skip' | 'keep' | 'merge';
    autoFavorite: boolean;
    extractLyrics: boolean;
    aiEnrichment: boolean;
  };
  theme: string;
  setImportSettings: (settings: Partial<LibraryContextType['importSettings']>) => void;
  setUserName: (name: string) => void;
  setTheme: (theme: string) => void;
  completeOnboarding: () => void;
  scanDirectory: () => Promise<void>;
  scanFiles: (files: FileList | File[]) => Promise<void>;
  rescanLibrary: () => Promise<void>;
  loadDemoLibrary: () => void;
  updateTrackMetadata: (trackId: string, updates: Partial<Track>) => void;
  enrichTrackMetadata: (trackId: string) => Promise<void>;
  recordPlay: (trackId: string) => void;
  toggleFavorite: (trackId: string) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string | string[]) => void;
  removeFromPlaylist: (playlistId: string, trackId: string | string[]) => void;
  deleteTracks: (trackIds: string[]) => void;
  deletePlaylist: (id: string) => void;
  clearAllData: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('cyan');
  const [isLoading, setIsLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    status: 'idle',
    totalFound: 0,
    processed: 0,
    duplicates: 0,
    unsupported: 0,
    errors: []
  });
  const [importSettings, setImportSettings] = useState({
    duplicateAction: 'skip' as const,
    autoFavorite: false,
    extractLyrics: true,
    aiEnrichment: true
  });

  const getDupeKey = (t: Partial<Track>) => `${t.title?.toLowerCase()}|${t.artist?.toLowerCase()}|${t.album?.toLowerCase()}`;

  // Load from IndexedDB on startup
  useEffect(() => {
    async function loadLibrary() {
      setIsLoading(true);
      try {
        const [savedTracks, savedPlaylists, user, onboarded, savedTheme, settings] = await Promise.all([
          getAllTracks(),
          getAllPlaylists(),
          getSetting('userName'),
          getSetting('isOnboarded'),
          getSetting('theme'),
          getSetting('importSettings')
        ]);

        if (savedTracks) setTracks(savedTracks);
        if (savedPlaylists) setPlaylists(savedPlaylists);
        if (user) setUserName(user);
        if (onboarded !== null) setIsOnboarded(onboarded);
        if (savedTheme) setTheme(savedTheme);
        if (settings) setImportSettings(settings);
      } catch (e) {
        console.error("Failed to load IndexedDB library", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLibrary();
  }, []);

  // Sync basic UI settings to DB (still use localStorage as fallback for instant hydration if needed)
  useEffect(() => {
    if (userName) saveSetting('userName', userName);
    saveSetting('isOnboarded', isOnboarded);
    saveSetting('theme', theme);
    saveSetting('importSettings', importSettings);

    localStorage.setItem('sonara_user', JSON.stringify({ name: userName, onboarded: isOnboarded }));
    localStorage.setItem('sonara_theme', theme);

    document.documentElement.className = '';
    if (theme !== 'cyan') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [userName, isOnboarded, theme, importSettings]);

  const smartPlaylists = useMemo(() => {
    if (tracks.length === 0) return [];
    
    return [
      {
        id: 'recently-added',
        name: 'Recently Added',
        tracks: [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 50)
      },
      {
        id: 'most-played',
        name: 'Most Played',
        tracks: [...tracks].filter(t => t.playCount > 0).sort((a, b) => b.playCount - a.playCount).slice(0, 50)
      },
      {
        id: 'recently-played',
        name: 'Recently Played',
        tracks: [...tracks].filter(t => t.lastPlayed).sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0)).slice(0, 50)
      },
      {
        id: 'favorites',
        name: 'Favorites',
        tracks: tracks.filter(t => t.isFavorite)
      }
    ];
  }, [tracks]);

  const enrichTrackMetadata = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const enrichment = await fetchMetadataForTrack(track);
    if (enrichment) {
      const updates: Partial<Track> = {
        title: enrichment.correctedTitle || track.title,
        artist: enrichment.correctedArtist || track.artist,
        album: enrichment.correctedAlbum || track.album,
        year: enrichment.releaseYear || track.year,
        syncedLyrics: enrichment.syncedLyrics || track.syncedLyrics,
        genre: enrichment.genre || track.genre,
      };
      updateTrackMetadata(trackId, updates);
    }
  };

  const scanFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setScanProgress({ status: 'scanning', totalFound: 0, processed: 0, duplicates: 0, unsupported: 0, errors: [] });

    const newTracks: Track[] = [];
    const existingKeys = new Set(tracks.map(t => getDupeKey(t)));
    const fileList = Array.from(files);

    for (const file of fileList) {
      const isAudio = file.type.startsWith('audio/') || ['.mp3', '.flac', '.ogg', '.wav', '.m4a'].some(ext => file.name.endsWith(ext));
      
      if (isAudio) {
        setScanProgress(p => ({ ...p, totalFound: p.totalFound + 1 }));
        
        try {
          const metadata = await mm.parseBlob(file);
          const { common, format } = metadata;
          
          let cover: string | undefined;
          if (common.picture && common.picture.length > 0) {
            const pic = common.picture[0];
            cover = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));
          }

          const track: Track = {
            id: generateId(),
            title: common.title || file.name.replace(/\.[^/.]+$/, ""),
            artist: common.artist || 'Unknown Artist',
            album: common.album || 'Unknown Album',
            genre: common.genre?.[0] || 'Unknown Genre',
            duration: format.duration || 0,
            year: common.year,
            trackNumber: common.track.no || undefined,
            cover: cover,
            file: file,
            path: file.name,
            addedAt: Date.now(),
            playCount: 0,
            isFavorite: false
          };

          const finalDupeKey = getDupeKey(track);
          if (importSettings.duplicateAction === 'skip' && existingKeys.has(finalDupeKey)) {
             setScanProgress(p => ({ ...p, duplicates: p.duplicates + 1 }));
             continue;
          }

          newTracks.push(track);
          setScanProgress(p => ({ ...p, processed: p.processed + 1 }));

          if (importSettings.aiEnrichment) {
            enrichTrackMetadata(track.id);
          }
        } catch (e) {
          setScanProgress(p => ({ ...p, errors: [...p.errors, `Error reading ${file.name}`] }));
        }
      } else {
        setScanProgress(p => ({ ...p, unsupported: p.unsupported + 1 }));
      }
    }

    if (newTracks.length > 0) {
      await saveTracks(newTracks);
      setTracks(prev => [...prev, ...newTracks]);
    }
    
    setScanProgress(p => ({ ...p, status: 'completing' }));
    setTimeout(() => setScanProgress(p => ({ ...p, status: 'idle' })), 3000);
    setIsLoading(false);
  };

  const scanDirectory = async () => {
    try {
      // @ts-ignore
      const root = await window.showDirectoryPicker();
      setIsLoading(true);
      setScanProgress({ status: 'scanning', totalFound: 0, processed: 0, duplicates: 0, unsupported: 0, errors: [] });

      const newTracks: Track[] = [];
      const existingKeys = new Set(tracks.map(t => getDupeKey(t)));

      async function scan(handle: any) {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const isAudio = file.type.startsWith('audio/') || ['.mp3', '.flac', '.ogg', '.wav', '.m4a'].some(ext => file.name.endsWith(ext));
            if (isAudio) {
              setScanProgress(p => ({ ...p, totalFound: p.totalFound + 1 }));
              try {
                const metadata = await mm.parseBlob(file);
                const { common, format } = metadata;
                let cover: string | undefined;
                if (common.picture && common.picture.length > 0) {
                  const pic = common.picture[0];
                  cover = URL.createObjectURL(new Blob([pic.data], { type: pic.format }));
                }

                const track: Track = {
                  id: generateId(),
                  title: common.title || file.name.replace(/\.[^/.]+$/, ""),
                  artist: common.artist || 'Unknown Artist',
                  album: common.album || 'Unknown Album',
                  genre: common.genre?.[0] || 'Unknown Genre',
                  duration: format.duration || 0,
                  year: common.year,
                  trackNumber: common.track.no || undefined,
                  cover,
                  file,
                  path: entry.name,
                  addedAt: Date.now(),
                  playCount: 0,
                  isFavorite: false
                };

                if (importSettings.duplicateAction === 'skip' && existingKeys.has(getDupeKey(track))) {
                  setScanProgress(p => ({ ...p, duplicates: p.duplicates + 1 }));
                  continue;
                }

                newTracks.push(track);
                setScanProgress(p => ({ ...p, processed: p.processed + 1 }));
                if (importSettings.aiEnrichment) enrichTrackMetadata(track.id);
              } catch (e) {
                setScanProgress(p => ({ ...p, errors: [...p.errors, `Error reading ${file.name}`] }));
              }
            }
          } else if (entry.kind === 'directory') {
            await scan(entry);
          }
        }
      }

      await scan(root);
      if (newTracks.length > 0) {
        await saveTracks(newTracks);
        setTracks(prev => [...prev, ...newTracks]);
      }
      setScanProgress(p => ({ ...p, status: 'completing' }));
      setTimeout(() => setScanProgress(p => ({ ...p, status: 'idle' })), 3000);
    } catch (e) {
      console.error("Directory scan failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrackMetadata = async (trackId: string, updates: Partial<Track>) => {
    setTracks(prev => {
      const newTracks = prev.map(t => t.id === trackId ? { ...t, ...updates } : t);
      const updatedTrack = newTracks.find(t => t.id === trackId);
      if (updatedTrack) saveTracks([updatedTrack]);
      return newTracks;
    });
  };

  const recordPlay = async (trackId: string) => {
    setTracks(prev => {
      const newTracks = prev.map(t => t.id === trackId ? { ...t, playCount: t.playCount + 1, lastPlayed: Date.now() } : t);
      const updatedTrack = newTracks.find(t => t.id === trackId);
      if (updatedTrack) saveTracks([updatedTrack]);
      return newTracks;
    });
  };

  const toggleFavorite = async (trackId: string) => {
    setTracks(prev => {
      const newTracks = prev.map(t => t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t);
      const updatedTrack = newTracks.find(t => t.id === trackId);
      if (updatedTrack) saveTracks([updatedTrack]);
      return newTracks;
    });
  };

  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = { id: generateId(), name, trackIds: [], createdAt: Date.now() };
    await savePlaylist(newPlaylist);
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = async (playlistId: string, trackId: string | string[]) => {
    const idsToAdd = Array.isArray(trackId) ? trackId : [trackId];
    setPlaylists(prev => {
      const nextPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          const updated = { ...p, trackIds: Array.from(new Set([...p.trackIds, ...idsToAdd])) };
          savePlaylist(updated);
          return updated;
        }
        return p;
      });
      return nextPlaylists;
    });
  };

  const removeFromPlaylist = (playlistId: string, trackId: string | string[]) => {
    const idsToRemove = Array.isArray(trackId) ? trackId : [trackId];
    setPlaylists(prev => {
      const nextPlaylists = prev.map(p => {
        if (p.id === playlistId) {
          const updated = { ...p, trackIds: p.trackIds.filter(id => !idsToRemove.includes(id)) };
          savePlaylist(updated);
          return updated;
        }
        return p;
      });
      return nextPlaylists;
    });
  };

  const deleteTracks = async (trackIds: string[]) => {
    await deleteTracksFromDB(trackIds);
    setTracks(prev => prev.filter(t => !trackIds.includes(t.id)));
    setPlaylists(prev => {
      const nextPlaylists = prev.map(p => {
        const updated = { ...p, trackIds: p.trackIds.filter(id => !trackIds.includes(id)) };
        savePlaylist(updated);
        return updated;
      });
      return nextPlaylists;
    });
  };

  const deletePlaylist = async (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    await db.playlists.delete(id);
  };

  const completeOnboarding = () => setIsOnboarded(true);
  
  const rescanLibrary = async () => {
    // Collect all current file handles if possible, or just re-read IndexedDB
    // For now, let's just trigger a re-enrichment of all tracks
    tracks.forEach(t => enrichTrackMetadata(t.id));
  };

  const clearAllData = async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <LibraryContext.Provider value={{
      tracks, playlists, smartPlaylists, isLoading, scanProgress, importSettings, userName, isOnboarded, theme,
      setImportSettings: s => setImportSettings(p => ({ ...p, ...s })),
      setUserName, setTheme, completeOnboarding, scanDirectory, scanFiles, rescanLibrary, loadDemoLibrary: () => {},
      updateTrackMetadata, enrichTrackMetadata, recordPlay, toggleFavorite, createPlaylist, addToPlaylist, removeFromPlaylist, deleteTracks, deletePlaylist, clearAllData
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) throw new Error('useLibrary must be used within a LibraryProvider');
  return context;
}
