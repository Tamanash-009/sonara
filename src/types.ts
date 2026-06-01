export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  year?: number;
  trackNumber?: number;
  cover?: string;
  file: File | string; // URL or File object
  path?: string;
  // Metadata for smart playlists
  addedAt: number;
  playCount: number;
  lastPlayed?: number;
  isFavorite?: boolean;
  lyrics?: string;
  syncedLyrics?: LyricLine[];
  providerId?: string; // New: Online source identifier
  providerUrl?: string; // New: Streaming URL
}

export interface ExtensionProvider {
  id: string;
  name: string;
  description: string;
  type: 'music' | 'metadata' | 'lyrics' | 'recommendation';
  icon: string;
  status: 'available' | 'installed' | 'enabled' | 'disabled';
  isDefault?: boolean;
  author: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export interface EQSettings {
  enabled: boolean;
  preset: string;
  bands: { frequency: number; gain: number }[];
}

export interface SleepTimerState {
  remainingSeconds: number | null;
  totalSeconds: number | null;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  originalQueue: Track[]; // To restore order when shuffle is off
  history: Track[];
  volume: number;
  muted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  shuffle: boolean;
  progress: number;
  isBuffering: boolean;
  playbackError: string | null;
  eq: EQSettings;
  saveEQPerTrack?: boolean;
  sleepTimer: SleepTimerState;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface ResolvedStream {
  url: string;
  source: string;
  format: 'mp3' | 'm4a' | 'webm';
  bitrate: number;
  expiry?: number;
}

export interface ScanProgress {
  status: 'idle' | 'scanning' | 'completing';
  totalFound: number;
  processed: number;
  duplicates: number;
  unsupported: number;
  errors: string[];
}
