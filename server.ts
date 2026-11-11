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
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasGoogle = Boolean(process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim());
  const hasApi = Boolean(process.env.API_KEY && process.env.API_KEY.trim());
  res.json({ 
    status: "ok", 
    server: "healthy",
    service: "Saudi Public Services Command Center",
    runtime: "express-server",
    geminiConfigured: hasGemini || hasGoogle || hasApi,
    keyDetected: { hasGemini, hasGoogle, hasApi },
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

import fs from "fs";
const ACCOUNTS_FILE = path.join(process.cwd(), "user_accounts_store.json");

function getStoredAccounts() {
  if (fs.existsSync(ACCOUNTS_FILE)) {
    try {
      const content = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error reading ACCOUNTS_FILE", e);
    }
  }
  return [
    {
      id: "usr-abdulmalik-838",
      username: "emp_838",
      displayName: "عبد الملك",
      password: "rs$BMjpy",
      role: "employee",
      workspaceName: "مساحة عبد الملك",
      workspaceId: "ws-emp-838",
      status: "active",
      createdAt: "١٢/١١/٢٠٢٦",
      notes: "موظف معتمد في المكتب",
      storagePolicy: "local_only",
      permissions: {
        canUseCalculator: true,
        canManageTasks: true,
        canUseAI: true,
        canViewPlatforms: true,
        canEditPlatforms: false,
        canUseScratchpad: true,
        canAccessSettings: false
      }
    }
  ];
}

function saveStoredAccounts(accounts: any[]) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing ACCOUNTS_FILE", e);
  }
}

// User Accounts CRUD endpoints for cross-device authentication
app.get("/api/accounts", (_req: express.Request, res: express.Response) => {
  res.json(getStoredAccounts());
});

app.post("/api/accounts", (req: express.Request, res: express.Response) => {
  const account = req.body;
  if (!account || !account.username || !account.password) {
    res.status(400).json({ error: "Missing required account fields" });
    return;
  }
  const accounts = getStoredAccounts();
  const existingIdx = accounts.findIndex(
    (a: any) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...account };
  } else {
    accounts.unshift(account);
  }
  saveStoredAccounts(accounts);
  res.json({ success: true, account });
});

app.delete("/api/accounts/:id", (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const accounts = getStoredAccounts();
  const filtered = accounts.filter((a: any) => a.id !== id && a.username !== id);
  saveStoredAccounts(filtered);
  res.json({ success: true, deletedId: id });
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
