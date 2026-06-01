import { Track } from '../types';

/**
 * Mock Streaming Provider inspired by Echo Nightly.
 * In a real app, this would connect to various open APIs (InnerTube, SoundCloud, etc.)
 */

export interface TrendingContent {
  id: string;
  title: string;
  artist: string;
  cover: string;
  url: string;
}

export const streamingProvider = {
  getTrending: async (): Promise<Track[]> => {
    // Simulating API latency
    await new Promise(r => setTimeout(r, 800));
    
    return [
      {
        id: 'stream-1',
        title: 'Starboy',
        artist: 'The Weeknd',
        album: 'Starboy',
        genre: 'Pop',
        cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 230,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      },
      {
        id: 'stream-2',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        genre: 'Synthpop',
        cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 200,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      },
      {
        id: 'stream-3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        genre: 'Disco',
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 203,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      },
      {
        id: 'stream-4',
        title: 'Midnight City',
        artist: 'M83',
        album: 'Hurry Up, We\'re Dreaming',
        genre: 'Indie Pop',
        cover: 'https://images.unsplash.com/photo-1514525253361-bee87184f47d?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: 243,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      }
    ];
  },

  getRecommendations: async (trackId?: string): Promise<Track[]> => {
    // Simulating personalized recommendations
    return [
      {
        id: 'rec-1',
        title: 'After Hours',
        artist: 'The Weeknd',
        album: 'After Hours',
        genre: 'Synthpop',
        cover: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        duration: 362,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      },
      {
        id: 'rec-2',
        title: 'Stay',
        artist: 'The Kid LAROI & Justin Bieber',
        album: 'F*CK LOVE 3',
        genre: 'Pop',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        duration: 141,
        addedAt: Date.now(),
        playCount: 0,
        providerId: 'yt-music'
      }
    ];
  }
};
