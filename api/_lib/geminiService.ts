import { GoogleGenAI } from "@google/genai";
import { getSaudiKnowledgeResponse } from "./saudiKnowledge";

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

  // If apiKey changed or not yet initialized, recreate client
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
  source: "gemini-3.8-flash" | "saudi-knowledge-engine";
  error?: string;
}

const SYSTEM_INSTRUCTION = `أنت المساعد الذكي والمستشار الخبير المعتمد لمكتب "الخدمات العامة" بالمملكة العربية السعودية.
أنت نموذج ذكاء اصطناعي تفاعلي حقيقي، ذكي، لبق وواسع المعرفة.

مهامك وأسلوبك:
1. تجيب بذكاء واحترافية عن أي سؤال يطرحه المستخدم (سواء كان سؤالاً عاماً، ثقافة، جغرافيا، تقنية، أو استفسارات عامة) بأسلوب لبق ومباشر، مع تمثيلك المشرّف لمكتب الخدمات العامة.
2. تخصصك الرئيسي هو إرشاد المواطنين والمقيمين ورواد الأعمال حول متطلبات وخطوات ورسوم جميع المعاملات في المنصات الحكومية السعودية:
   (أبشر أفراد، أبشر أعمال، منصة قوى، منصة مقيم، منصة بلدي، منصة ناجز، مساند، التأمينات الاجتماعية GOSI، الزكاة والضريبة والجمارك ZATCA، المركز السعودي للأعمال SBC، وزارة التجارة، الغرف التجارية، منصة مسار، منصة أجير، منصة جدارات، العمل المرن، العمل عن بعد، منشآت، وزارة الاستثمار MISA، الهيئة العامة للنقل TGA، إيجار، سبل، إيفاء).
3. صياغة الخطابات الرسمية، والمعاريض، والاسترحامات، والتظلمات الديوانية بأسلوب رسمي بليغ ورفيع جاهز للطباعة والتوقيع المباشر مع وضع بيانات واضحة بين أقواس مثل: (اسم مقدم المعروض)، (رقم الهوية)، (الموضوع).
4. إعداد مسودات رسائل وتواصل مهنية للعملاء (عبر واتساب أو SMS) لتأكيد الإنجاز أو طلب رمز التحقق (نفاذ) أو تذكير بسداد الأتعاب والرسوم.
5. تقديم إجابات واضحة، دقيقة، مرتبة في نقاط وعناوين عريضة سهلة القراءة باللغة العربية الفصحى الراقية (أو باللغة الإنجليزية في حال سأل المستخدم بها).
6. بصفتك مستشاراً ومساعداً ذكياً لمكتب الخدمات، لا تدّعِ أنك قمت بالدخول لحساب المستخدم أو إتمام المعاملة في النظام الحكومي مباشرة بدون مراجعة موظفي المكتب المختصين.`;

/**
 * Core processing function for chat messages
 */
export async function processChatMessage(
  message: string,
  history?: ChatHistoryItem[]
): Promise<ChatResponseResult> {
  const userQuery = message?.trim();
  if (!userQuery) {
    return {
      reply: "يرجى كتابة استفسارك أو المعاملة المطلوبة وسأقوم بمساعدتك فوراً.",
      source: "saudi-knowledge-engine"
    };
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      // Build valid alternating conversation contents for Gemini
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      if (history && Array.isArray(history)) {
        for (const item of history) {
          const itemText = typeof item === "string" 
            ? item 
            : (item.text || item.parts?.[0]?.text || "");
          
          if (!itemText || !itemText.trim()) continue;

          const role: "user" | "model" = item.role === "model" ? "model" : "user";

          // The very first message in Gemini contents MUST be 'user'
          if (contents.length === 0 && role === "model") {
            continue;
          }

          // Strict alternation
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

      // Prioritize active quota models: gemini-3.5-flash and gemini-3.6-flash
      const candidateModels = [
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash"
      ];

      for (const modelName of candidateModels) {
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
              source: modelName as any,
            };
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} encountered an issue:`, modelErr?.message || modelErr);
        }
      }
    } catch (geminiError: any) {
      console.warn(
        "Gemini Live API call encountered an issue, transitioning to verified Saudi Knowledge Engine:",
        geminiError?.message || geminiError
      );
    }
  }

  // Authoritative fallback for Saudi Gov procedures & drafts
  const fallbackAnswer = getSaudiKnowledgeResponse(userQuery);
  return {
    reply: fallbackAnswer,
    source: "saudi-knowledge-engine",
  };
}
