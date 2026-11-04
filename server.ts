import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: "5mb" }));

import { getSaudiKnowledgeResponse } from "./src/utils/saudiKnowledge";

import { processChatMessage, getGeminiClient } from "./src/server/geminiService";

app.get("/api/health", (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.API_KEY
  );
  res.json({ 
    status: "ok", 
    server: "healthy",
    service: "Saudi Public Services Command Center",
    runtime: "express-server",
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString() 
  });
});

// AI Chat Assistant endpoint for Saudi Government and General Services
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "الرسالة مطلوبة" });
    return;
  }

  const result = await processChatMessage(message, history);
  res.json(result);
});

// Serve frontend with Vite integration
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Command Center Server running on port ${PORT}`);
  });
}

setupVite();
