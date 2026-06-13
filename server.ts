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

// Initialize Gemini Client utilities safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
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
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Chat Assistant endpoint for Saudi Government and General Services
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
       res.status(400).json({ error: "الرسالة مطلوبة" });
       return;
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      if (err.message === "GEMINI_API_KEY_MISSING") {
         res.json({
          reply: "⚠️ لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY). يرجى التأكد من إضافة المفتاح في لوحة الإعدادات والمفاتيح الجانبية لكي يعمل المساعد الذكي بكفاءة عالية.",
          isConfigError: true
        });
        return;
      }
      throw err;
    }

    const systemInstruction = `أنت مساعد ذكي ومستشار خبير في الخدمات الحكومية السعودية وتخليص المعاملات الإلكترونية في "مكتب الخدمات العامة".
مهمتك الرئيسية هي:
1. إرشاد الموظف أو العميل حول خطوات وشرط ومتطلبات جميع المعاملات على المنصات الحكومية مثل: (أبشر، قوى، ناجز، مساند، مقيم، بلدي، وزارة التجارة، التأمينات، الزكاة والضريبة، النفاذ الوطني، إلخ).
2. صياغة الخطابات الرسمية، والرسائل الإدارية، وتعديل ومراجعة المعاريض والشكاوى الموجهة للمؤسسات والوزارات بأسلوب رسمي بليغ واحترافي جداً في المملكة العربية السعودية.
3. المساعدة في كتابة مسودات رسائل واتساب ورسائل قصيرة للتواصل مع العملاء لمتابعة معاملاتهم وتذكيرهم بالدفعات أو تسليم الأوراق والتوثيقات المطلوبة.

قواعد الإجابة:
- تحدث باللغة العربية الفصحى دائماً بأسلوب مهني ووقور، ودود واحترافي.
- نسق الإجابات دائماً باستخدام نقاط واضحة وعناوين فرعية عريضة مميزة وسهلة القراءة لجعلها تبدو كدليل مرجعي حقيقي.
- عند شرح أي خدمة حكومية، رتب الإجابة بالشكل التالي: الخطوات الأساسية، المتطلبات والوثائق اللازمة، والرسوم المتوقعة (إن وجدت).
- في حال صياغة خطاب، قدم صيغة كاملة وجاهزة للنسخ المباشر محاطة برموز واضحة مع ترك فراغات واضحة للأسماء والتواريخ والبيانات الشخصية بين قوسين مثل: (اسم العميل)، (رقم الهوية)، إلخ.`;

    // Process and format previous system history for the SDK format if provided
    const chatConfig: any = {
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    };

    // Since we're using basic single turn content generation (which is stateless, highly robust and easy to handle history), 
    // we can pass the history combined into contents or pass custom messages
    let contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      // Map history items into GoogleGenAI content parts format
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text || h.parts?.[0]?.text || "" }]
        });
      });
    }
    
    // Append the current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: chatConfig.model,
      contents: contents,
      config: chatConfig.config,
    });

    const text = response.text || "عذراً، لم أتمكن من معالجة هذا الطلب حالياً.";
     res.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
     res.status(500).json({ 
      error: "حدث خطأ أثناء الاتصال بخادم الذكاء الاصطناعي", 
      details: error.message || error 
    });
  }
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
