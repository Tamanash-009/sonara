import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
  const MODEL_NAME = "gemini-3-flash-preview";

  // API Route for metadata enrichment
  app.post("/api/ai/enrich", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API Key" });
    }

    const { track } = req.body;
    try {
      const prompt = `
        As a music metadata expert, provide detailed information for the following track:
        Title: ${track.title}
        Artist: ${track.artist}
        Album: ${track.album}

        Return a JSON object with:
        1. Corrected title, artist, album, and release year.
        2. Comprehensive synced lyrics in JSON array format [{time: seconds, text: "line"}].
        3. A detailed 500-character description of the track and artist.
        4. List of 5 similar tracks (title and artist).
        5. Musical genre and mood.

        Respond ONLY with valid JSON.
      `;

      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      const text = result.text || "";
      
      // Clean up potential markdown formatting
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("AI Enrichment failed", e);
      res.status(500).json({ error: "AI Enrichment failed" });
    }
  });

  // API Route for recommendations
  app.post("/api/ai/recommend", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing API Key" });
    }

    const { history } = req.body;
    try {
      const prompt = `
        Based on the user's favorite music: ${history},
        Recommend 10 similar tracks that they would love.
        Return as a JSON array of objects with title, artist, and reasoning.
        Respond ONLY with valid JSON.
      `;

      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      const text = result.text || "";
      
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (e) {
      console.error("AI Recommendation failed", e);
      res.status(500).json({ error: "AI Recommendation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
