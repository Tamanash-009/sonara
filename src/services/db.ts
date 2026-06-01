import Dexie, { Table } from 'dexie';
import { Track, Playlist, LyricLine } from '../types';

export class SonaraDatabase extends Dexie {
  tracks!: Table<Track>;
  playlists!: Table<Playlist>;
  metadata!: Table<{ id: string; lyrics?: string; syncedLyrics?: LyricLine[]; lastSynced?: number }>;
  settings!: Table<{ key: string; value: any }>;

  constructor() {
    super('SonaraDB');
    this.version(3).stores({
      tracks: 'id, title, artist, album, genre, addedAt, playCount, isFavorite, providerId',
      playlists: 'id, name, createdAt',
      metadata: 'id, lastSynced',
      settings: 'key',
      recommendations: 'id, timestamp',
      extensions: 'id, status, isDefault'
    });
  }
}

export const db = new SonaraDatabase();

// Helper functions for common operations
export async function saveTrack(track: Track) {
  return await db.tracks.put(track);
}

export async function saveTracks(tracks: Track[]) {
  return await db.tracks.bulkPut(tracks);
}

export async function getAllTracks() {
  return await db.tracks.toArray();
}

export async function deleteTracksFromDB(ids: string[]) {
  return await db.tracks.bulkDelete(ids);
}

export async function savePlaylist(playlist: Playlist) {
  return await db.playlists.put(playlist);
}

export async function getAllPlaylists() {
  return await db.playlists.toArray();
}

export async function saveSetting(key: string, value: any) {
  return await db.settings.put({ key, value });
}

export async function getSetting(key: string) {
  const setting = await db.settings.get(key);
  return setting ? setting.value : null;
}
