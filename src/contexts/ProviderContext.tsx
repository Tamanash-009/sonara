import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ExtensionProvider, Track, ResolvedStream } from '../types';
import { db } from '../services/db';

interface ProviderContextType {
  providers: ExtensionProvider[];
  activeProviders: ExtensionProvider[];
  toggleProvider: (id: string) => Promise<void>;
  setDefaultProvider: (id: string, type: string) => Promise<void>;
  searchProviders: (query: string) => Promise<{ results: Track[], errors: string[] }>;
  resolveStream: (track: Track) => Promise<ResolvedStream>;
  providerHealth: Record<string, 'healthy' | 'error' | 'loading'>;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

const INITIAL_PROVIDERS: ExtensionProvider[] = [
  {
    id: 'yt-music',
    name: 'YouTube Music',
    description: 'Universal streaming provider for access to millions of tracks, albums and live sessions.',
    type: 'music',
    icon: 'https://www.gstatic.com/youtube/img/branding/youtubemusic/2x/youtubemusic_vertical_white.png',
    status: 'enabled',
    author: 'Sonara Open Network',
    isDefault: true
  },
  {
    id: 'lrclib',
    name: 'LRCLIB',
    description: 'Premium lyrics engine providing high-quality synced lyrics for almost any track.',
    type: 'lyrics',
    icon: 'https://lrclib.net/static/images/logo.png',
    status: 'enabled',
    author: 'Open Source Community',
    isDefault: true
  },
  {
    id: 'spotify-meta',
    name: 'Spotify Meta',
    description: 'High-fidelity metadata and artwork provider for library enrichment.',
    type: 'metadata',
    icon: 'https://developer.spotify.com/images/guidelines/design/icon1.png',
    status: 'installed',
    author: 'Meta Bridge'
  },
  {
    id: 'musicbrainz',
    name: 'MusicBrainz',
    description: 'Comprehensive open-source encyclopedia for detailed track tagging and discography linking.',
    type: 'metadata',
    icon: 'https://static.bloodhound.rocks/musicbrainz_logo.png',
    status: 'installed',
    author: 'MetaBrainz Foundation'
  },
  {
    id: 'apple-meta',
    name: 'Apple Music Meta',
    description: 'High-quality artwork and curated metadata directly from Apple’s global catalog.',
    type: 'metadata',
    icon: 'https://www.apple.com/v/apple-music/q/images/overview/icon_apple_music__f9v71alqc62m_large_2x.png',
    status: 'installed',
    author: 'Sonara Media Proxy'
  },
  {
    id: 'lastfm',
    name: 'Last.fm Pulse',
    description: 'AI-driven recommendation engine based on global listening trends.',
    type: 'recommendation',
    icon: 'https://www.last.fm/static/images/logo_700.67919ae9766a.png',
    status: 'available',
    author: 'AudioScrobbler Group'
  }
];

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<ExtensionProvider[]>(INITIAL_PROVIDERS);
  const [providerHealth, setProviderHealth] = useState<Record<string, 'healthy' | 'error' | 'loading'>>({});
  const [searchCache, setSearchCache] = useState<Record<string, Track[]>>({});

  useEffect(() => {
    async function loadProviders() {
      const saved = await db.table('extensions').toArray();
      if (saved.length > 0) {
        setProviders(prev => prev.map(p => {
          const s = saved.find(item => item.id === p.id);
          return s ? { ...p, status: s.status, isDefault: s.isDefault } : p;
        }));
      }
    }
    loadProviders();
  }, []);

  const toggleProvider = async (id: string) => {
    setProviders(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          const newStatus = p.status === 'enabled' ? 'installed' : 'enabled';
          db.table('extensions').put({ id: p.id, status: newStatus, isDefault: p.isDefault });
          return { ...p, status: newStatus as any };
        }
        return p;
      });
      return next;
    });
  };

  const setDefaultProvider = async (id: string, type: string) => {
    setProviders(prev => {
      const next = prev.map(p => {
        if (p.type === type) {
          const isDef = p.id === id;
          db.table('extensions').put({ id: p.id, status: p.status, isDefault: isDef });
          return { ...p, isDefault: isDef };
        }
        return p;
      });
      return next;
    });
  };

  const virtualSearch = async (providerId: string, query: string): Promise<Track[]> => {
    // This simulates individual provider API response logic
    await new Promise(r => setTimeout(r, 600 + Math.random() * 1000));
    
    // Randomly fail sometimes to test error handling
    if (Math.random() < 0.1) throw new Error(`${providerId} connection timeout`);

    return [
      {
        id: `${providerId}_${Math.random()}`,
        title: `${query} [${providerId === 'yt-music' ? 'Streaming' : 'Cloud'}]`,
        artist: providerId === 'yt-music' ? 'Trending Artist' : 'Global Discovery',
        album: 'Online Discovery',
        genre: 'Streaming',
        file: `https://stream.sonara.cloud/${providerId}/track`,
        duration: 210,
        addedAt: Date.now(),
        playCount: 0,
        isFavorite: false,
        providerId: providerId,
        cover: `https://images.unsplash.com/photo-${providerId === 'yt-music' ? '1614613535308' : '1470225620780'}?w=300&h=300&q=80`
      }
    ];
  };

  const searchProviders = async (query: string): Promise<{ results: Track[], errors: string[] }> => {
    const activeMusicProviders = providers.filter(p => p.type === 'music' && p.status === 'enabled');
    if (activeMusicProviders.length === 0) return { results: [], errors: [] };

    const cacheKey = `${query.toLowerCase()}_${activeMusicProviders.map(p => p.id).join('_')}`;
    if (searchCache[cacheKey]) {
      return { results: searchCache[cacheKey], errors: [] };
    }

    const errors: string[] = [];
    const allResults: Track[] = [];

    const searchPromises = activeMusicProviders.map(async (provider) => {
      setProviderHealth(prev => ({ ...prev, [provider.id]: 'loading' }));
      try {
        // Create a timeout for this specific provider
        const providerFetch = virtualSearch(provider.id, query);
        const timeout = new Promise<Track[]>((_, reject) => 
          setTimeout(() => reject(new Error(`${provider.name} timed out`)), 8000)
        );

        const results = await Promise.race([providerFetch, timeout]);
        setProviderHealth(prev => ({ ...prev, [provider.id]: 'healthy' }));
        return results;
      } catch (err) {
        setProviderHealth(prev => ({ ...prev, [provider.id]: 'error' }));
        errors.push(err instanceof Error ? err.message : 'Unknown error');
        return [];
      }
    });

    const settledResults = await Promise.all(searchPromises);
    settledResults.forEach(res => allResults.push(...res));

    // Cache valid results
    if (allResults.length > 0) {
      setSearchCache(prev => ({ ...prev, [cacheKey]: allResults }));
    }

    return { results: allResults, errors };
  };

  const resolveStream = async (track: Track): Promise<ResolvedStream> => {
    const { streamResolver } = await import('../services/streamResolver');
    return await streamResolver.resolve(track);
  };

  return (
    <ProviderContext.Provider value={{ 
      providers, 
      activeProviders: providers.filter(p => p.status === 'enabled'),
      toggleProvider,
      setDefaultProvider,
      searchProviders,
      resolveStream,
      providerHealth
    }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviders() {
  const context = useContext(ProviderContext);
  if (!context) throw new Error('useProviders must be used within a ProviderProvider');
  return context;
}
