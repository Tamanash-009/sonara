import { Track } from "../types";

export async function fetchMetadataForTrack(track: Partial<Track>) {
  try {
    const response = await fetch("/api/ai/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error("Failed to fetch metadata with AI", e);
    return null;
  }
}

export async function generateRecommendations(tracks: Track[]) {
  if (tracks.length === 0) return [];

  try {
    const history = tracks.slice(0, 10).map(t => `${t.title} by ${t.artist}`).join(', ');
    const response = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history })
    });
    
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.error("Failed to generate recommendations", e);
    return [];
  }
}
