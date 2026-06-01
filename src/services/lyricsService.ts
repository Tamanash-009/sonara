import { LyricLine } from '../types';

export interface LyricsResult {
  synced: LyricLine[] | null;
  plain: string | null;
}

export async function fetchLyrics(title: string, artist: string, duration: number): Promise<LyricsResult | null> {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const response = await fetch(`https://lrclib.net/api/search?q=${query}`);
    const data = await response.json();

    if (data && data.length > 0) {
      // Find the best match by duration
      const bestMatch = data.find((item: any) => Math.abs(item.duration - duration) < 5) || data[0];
      
      return {
        synced: bestMatch.syncedLyrics ? parseLRC(bestMatch.syncedLyrics) : null,
        plain: bestMatch.plainLyrics || null
      };
    }
  } catch (error) {
    console.error('Failed to fetch lyrics:', error);
  }
  return null;
}

function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d+):(\d+)\.(\d+)\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });

  return result;
}
