import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processChatMessage } from "./_lib/geminiService";

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
    res.status(405).json({ error: "الطريقة غير مسموح بها. يرجى استخدام POST." });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        // use raw body or empty object
      }
    }

    const { message, history } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "حقل الرسالة مطلوب ويجب ألا يكون فارغاً" });
      return;
    }

    const result = await processChatMessage(message, history);
    res.status(200).json(result);
  } catch (error: any) {
    // Log safe error without exposing any internal credentials
    console.error("Vercel Chat Serverless Function Error:", error?.message || error);
    
    // Always return a graceful and polite authoritative Arabic response so the user never sees 500
    res.status(200).json({
      reply: "أهلاً بك في مكتب الخدمات العامة. حدث تأخير بسيط في الاتصال بالشبكة، تفضل بإعادة طرح سؤالك وسأقوم بخدمتك فوراً.",
      source: "saudi-knowledge-engine"
    });
  }
}
