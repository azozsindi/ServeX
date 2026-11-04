import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.API_KEY
  );

  res.status(200).json({
    status: "ok",
    runtime: "vercel-serverless",
    geminiConfigured: hasKey,
    time: new Date().toISOString()
  });
}
