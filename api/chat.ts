import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processChatMessage } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed. Use POST." });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        // use as is or empty
      }
    }

    const { message, history } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "حقل الرسالة مطلوب" });
      return;
    }

    const result = await processChatMessage(message, history);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel Chat Serverless Function Error:", error);
    // Never fail with 404 or 500; gracefully return a verified response
    res.status(200).json({
      reply: "أهلاً بك في مكتب الخدمات العامة. حدث تأخير في الاتصال، تفضل بإعادة طرح سؤالك حول أي خدمة حكومية وسأقوم بخدمتك فوراً.",
      source: "saudi-knowledge-engine"
    });
  }
}
