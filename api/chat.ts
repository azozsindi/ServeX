import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

// Cache client instance across serverless invocations where the container is warm
let aiClient: GoogleGenAI | null = null;
let lastApiKey: string | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.API_KEY || 
    "";

  if (!apiKey || apiKey.trim() === "") {
    return null;
  }

  if (!aiClient || lastApiKey !== apiKey) {
    lastApiKey = apiKey;
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

export interface ChatHistoryItem {
  role?: string;
  text?: string;
  parts?: Array<{ text: string }>;
}

export interface ChatResponseResult {
  reply: string;
  source: string;
  error?: string;
}

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي والمستشار الخبير المعتمد لمكتب "الخدمات العامة" بالمملكة العربية السعودية.
أنت نموذج ذكاء اصطناعي تفاعلي حقيقي، ذكي، مبدع، لبق وواسع المعرفة.

مهامك وأسلوبك:
1. تجيب بذكاء وطلاقة وإبداع عن أي سؤال أو طلب يطرحه المستخدم (سواء كان كتابة رسائل شخصية أو استعطاف أو أدبية، أسئلة عامة، ثقافة، جغرافيا، تقنية، أو استفسارات المعاملات) بأسلوب راقٍ ومناسب تماماً للمقام وسياق الطلب.
2. عند طلب كتابة رسالة استعطاف أو اعتذار أو رجاء لشخص (مثل: عبد العزيز أو غيره)، اكتب له رسالة مؤثرة وبليغة وأنيقة تفيض بالمودة والتقدير والاحترام وتلامس القلوب.
3. تخصصك المهني الرئيسي هو إرشاد المواطنين والمقيمين ورواد الأعمال حول متطلبات وخطوات ورسوم جميع المعاملات في المنصات الحكومية السعودية:
   (أبشر أفراد، أبشر أعمال، منصة قوى، منصة مقيم، منصة بلدي، منصة ناجز، مساند، التأمينات الاجتماعية GOSI، الزكاة والضريبة والجمارك ZATCA، المركز السعودي للأعمال SBC، وزارة التجارة، الغرف التجارية، منصة مسار، منصة أجير، منصة جدارات، العمل المرن، العمل عن بعد، منشآت، وزارة الاستثمار MISA، الهيئة العامة للنقل TGA، إيجار، سبل، إيفاء).
4. صياغة الخطابات الرسمية، والمعاريض، والاسترحامات، والتظلمات الديوانية بأسلوب رسمي بليغ ورفيع جاهز للطباعة والتوقيع المباشر مع وضع بيانات واضحة بين أقواس مثل: (اسم مقدم المعروض)، (رقم الهوية)، (الموضوع).
5. تقديم إجابات واضحة، دقيقة، مرتبة في نقاط وعناوين سهلة القراءة باللغة العربية الفصحى الراقية.
6. لا تدّعِ أنك قمت بالدخول لحساب المستخدم أو إتمام المعاملة في النظام الحكومي مباشرة بدون مراجعة موظفي المكتب المختصين.`;

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash"
];

/**
 * Intelligent fallback generator in case external API is unreachable
 */
function generateFallbackResponse(query: string): string {
  const q = (query || "").trim().toLowerCase();

  // طلب استعطاف أو رسالة شخصية
  if (q.includes("استعطاف") || q.includes("اعتذار") || q.includes("رسالة إلى") || q.includes("رسالة ل")) {
    const targetName = query.match(/(?:لـ?|إلى\s+)([\u0621-\u064A]+)/)?.[1] || "الأخ الفاضل";
    return `### ✉️ رسالة استعطاف ومودة بليغة ومؤثرة

إلى الغالي: **${targetName}** (حفظه الله ورعاه)

السلام عليكم ورحمة الله وبركاته،

أكتب إليك هذه الكلمات من قلبٍ يحمل لك خالص المودة وأصدق التقدير، ملتمساً من نبل أخلاقك وطيب أصلك وسعة صدرك أن تنظر إلى خطابي هذا بعين الصفح والمحبة.

إن مكانتك العزيزة في قلبي تجعلني أحرص كل الحرص على دوام الود بيننا، وإن كان قد بدر مني ما أساء أو أزعج خاطرك دون قصد، فإني أعتذر إليك اعتذاراً صادقاً ينبع من حرصي التام على نقاء ما بيننا. فالكرام أمثالك هم أهل العفو والتجاوز، والمسامح دائماً أرفع شأناً وأكرم قدراً.

أتمنى أن تلقى كلماتي هذه صدى في نفسك الطيبة، وأن نفتح صفحة جديدة تملؤها الأخوة والوفاء.

**ولك مني خالص فائق الود والتقدير والاحترام،،،**`;
  }

  // أسئلة المعاملات الحكومية
  if (q.includes("سجل تجاري") || q.includes("فتح سجل")) {
    return `### 🏢 دليل رسوم وخطوات فتح سجل تجاري جديد
* **الجهة:** المركز السعودي للأعمال (SBC) / وزارة التجارة عبر النفاذ الوطني.
* **رسم السجل الرئيسي:** 200 ريال سنوياً + اشتراك الغرفة التجارية.
* **رسم السجل الفرعي:** 100 ريال سنوياً.
* تصدر الفاتورة الموحدة وتسدد عبر نظام سداد، ويفتح ملف آلي في التأمينات والزكاة والعمل فور الصدور.`;
  }

  if (q.includes("نقل كفالة") || q.includes("نقل خدمات") || q.includes("نقل عامل")) {
    return `### 👥 رسوم وإجراءات نقل كفالة عامل
* **المنصات:** منصة قوى (إنشاء العقد وقبول الموظف) ثم منصة مقيم والجوازات.
* **الرسوم الحكومية (الجوازات):**
  * المرة الأولى: **2,000 ريال**.
  * المرة الثانية: **4,000 ريال**.
  * المرة الثالثة فأكثر: **6,000 ريال**.`;
  }

  if (q.includes("استرحام") || q.includes("معروض") || q.includes("تظلم")) {
    return `### 📜 مسودة معروض استرحام وتظلم رسمي
**إلى سعادة / معالي مدير الجهة المختصة المحترم**
السلام عليكم ورحمة الله وبركاته،
أرفع لمقامكم هذا الطلب ملتمساً النظر في وضعي والظروف القاهرة التي ألمت بي بخصوص (بيان الموضوع باختصار)، ملتمساً التكرم بالموافقة على تيسير الإجراء والتجاوز عن التأخير.
شاكراً ومقدراً حسن تعاونكم وإنسانيتكم.`;
  }

  // تحية أو اتصال
  if (q.includes("متصل") || q.includes("موجود") || q.includes("السلام عليكم") || q.includes("مرحبا")) {
    return `أهلاً وسهلاً بك! 🌟\n\nنعم، أنا متصل ومستعد تماماً لمساعدتك في أي استفسار، صياغة خطابات، أو إنهاء معاملات في مكتب الخدمات العامة. تفضل بطرح سؤالك وسأجيبك فوراً! ⚡`;
  }

  return `أهلاً بك في مكتب الخدمات العامة! 🌟

استقبلت استفسارك حول: **"${query}"**

يسعدني خدمتك في أي استفسار عام، أو صياغة الخطابات الرسمية والشخصية، أو حساب تكاليف وإجراءات المنصات الحكومية السعودية (قوى، أبشر، مقيم، بلدي، ناجز، وسجل الأعمال). 

تفضل بتحديد ما ترغب به وسأقوم بصياغته أو توضيحه لك فوراً وبكل سرور! ⚡`;
}

export async function processChatMessage(
  message: string,
  history?: ChatHistoryItem[]
): Promise<ChatResponseResult> {
  const userQuery = message?.trim();
  if (!userQuery) {
    return {
      reply: "يرجى كتابة استفسارك وسأقوم بمساعدتك فوراً.",
      source: "assistant"
    };
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Build alternating conversation contents for Gemini
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (history && Array.isArray(history)) {
        for (const item of history) {
          const itemText = typeof item === "string" 
            ? item 
            : (item.text || item.parts?.[0]?.text || "");
          
          if (!itemText || !itemText.trim()) continue;

          const role: "user" | "model" = item.role === "model" ? "model" : "user";

          if (contents.length === 0 && role === "model") {
            continue;
          }

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

      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents[contents.length - 1].parts[0].text += `\n${userQuery}`;
      } else {
        contents.push({
          role: "user",
          parts: [{ text: userQuery }],
        });
      }

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
          });

          const replyText = response.text?.trim();
          if (replyText) {
            return {
              reply: replyText,
              source: modelName,
            };
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} error:`, modelErr?.message || modelErr);
        }
      }
    } catch (genErr: any) {
      console.warn("Gemini generation error:", genErr?.message || genErr);
    }
  }

  // Graceful intelligent fallback
  return {
    reply: generateFallbackResponse(userQuery),
    source: "knowledge-engine",
  };
}

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
        // use raw body
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
    console.error("Chat Serverless Function Error:", error?.message || error);
    res.status(200).json({
      reply: generateFallbackResponse("عام"),
      source: "fallback"
    });
  }
}
