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

import { getSaudiKnowledgeResponse } from "./src/server/saudiKnowledge";

// Initialize Gemini Client utilities safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString() 
  });
});

// AI Chat Assistant endpoint for Saudi Government and General Services
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "الرسالة مطلوبة" });
    return;
  }

  const userQuery = message.trim();

  // Try calling Gemini if API key is present
  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = `أنت مساعد ذكي ومستشار خبير في الخدمات الحكومية السعودية وتخليص المعاملات الإلكترونية في "مكتب الخدمات العامة".
مهمتك الرئيسية هي:
1. إرشاد الموظف أو العميل حول خطوات وشروط ومتطلبات جميع المعاملات على المنصات الحكومية مثل: (أبشر، قوى، ناجز، مساند، مقيم، بلدي، وزارة التجارة، التأمينات، الزكاة والضريبة والجمارك ZATCA، النفاذ الوطني، منصة إيجار، الغرف التجارية، إلخ).
2. صياغة الخطابات الرسمية، والرسائل الإدارية، وتعديل ومراجعة المعاريض والشكاوى والاسترحامات الموجهة للمؤسسات والوزارات بأسلوب رسمي بليغ واحترافي جداً في المملكة العربية السعودية.
3. المساعدة في كتابة مسودات رسائل واتساب ورسائل قصيرة للتواصل مع العملاء لمتابعة معاملاتهم وتذكيرهم بالدفعات أو تسليم الأوراق والتوثيقات المطلوبة.

قواعد الإجابة:
- تحدث باللغة العربية الفصحى دائماً بأسلوب مهني ووقور، ودود واحترافي.
- نسق الإجابات دائماً باستخدام نقاط واضحة وعناوين فرعية عريضة مميزة وسهلة القراءة لجعلها تبدو كدليل مرجعي حقيقي.
- عند شرح أي خدمة حكومية، رتب الإجابة بالشكل التالي: الخطوات الأساسية، المتطلبات والوثائق اللازمة، والرسوم المتوقعة (إن وجدت).
- في حال صياغة خطاب أو معروض، قدم صيغة كاملة وجاهزة للنسخ المباشر محاطة بحقول بيانات واضحة للأسماء والتواريخ والبيانات الشخصية بين قوسين مثل: (اسم العميل)، (رقم الهوية)، إلخ.`;

      // Build valid alternating conversation contents for Gemini
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (history && Array.isArray(history)) {
        for (const item of history) {
          const itemText = typeof item === "string" 
            ? item 
            : (item.text || item.parts?.[0]?.text || "");
          
          if (!itemText || !itemText.trim()) continue;

          // Normalize role
          const role: "user" | "model" = item.role === "model" ? "model" : "user";

          // The very first message in Gemini contents MUST be 'user'
          if (contents.length === 0 && role === "model") {
            continue; // Skip initial greeting from AI in history
          }

          // Ensure roles strictly alternate: merge if consecutive same roles
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n${itemText.trim()}`;
          } else {
            contents.push({
              role: role,
              parts: [{ text: itemText.trim() }],
            });
          }
        }
      }

      // Append current message
      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents[contents.length - 1].parts[0].text += `\n${userQuery}`;
      } else {
        contents.push({
          role: "user",
          parts: [{ text: userQuery }],
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const replyText = response.text?.trim();
      if (replyText) {
        res.json({ reply: replyText, source: "gemini-3.8-flash" });
        return;
      }
    } catch (geminiError: any) {
      console.warn("Gemini Live API call encountered an issue, transitioning to verified Saudi Knowledge Engine:", geminiError?.message || geminiError);
    }
  }

  // Graceful, authoritative fallback for Saudi Gov procedures & drafts
  const fallbackAnswer = getSaudiKnowledgeResponse(userQuery);
  res.json({
    reply: fallbackAnswer,
    source: "saudi-knowledge-engine",
    note: !process.env.GEMINI_API_KEY 
      ? "تم توفير الرد عبر الدليل المعتمد للخدمات السعودية. يمكنك تفعيل الذكاء المباشر بربط مفتاحك في Settings > Secrets."
      : undefined
  });
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
