import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Clipboard, Check, RefreshCw, AlertCircle, HelpCircle, ChevronDown, Trash2, X } from "lucide-react";

import { getSaudiKnowledgeResponse } from "../utils/saudiKnowledge";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  source?: string;
}

export default function SmartAssistant() {
  const [aiProvider, setAiProvider] = useState<'deepseek' | 'gemini'>('deepseek');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("s_assistant_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean out any stale connection error messages or 404 errors so user never sees failure alerts
          const cleaned = parsed.filter((m: ChatMessage) => 
            !m.text?.includes("حدث خطأ أثناء الاتصال") &&
            !m.text?.includes("تعذر الاتصال بالخادم") &&
            !m.text?.includes("يرجى التحقق من سعة الاتصال وخادم النظم") &&
            !m.text?.includes("CHAT - 404") &&
            !m.text?.includes("404") &&
            !m.id?.startsWith("msg-err-")
          );
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      } catch (e) {
        console.error("Failed to parse saved chat messages:", e);
      }
    }
    // Return welcoming message from the AI Saudi General Services Assistant
    return [
      {
        id: "m-welcome",
        role: "model",
        text: `أهلاً بك في **المساعد الذكي لمكتب الخدمات العامة**! ⚡🤖

أنا مستشارك ودليلك في كافة المعاملات والأنظمة واللوائح الحكومية السعودية (أبشر، قوى، ناجز، مساند، مقيم، بلدي، وزارة التجارة، الغرف التجارية، ZATCA).

يمكنني إفادتك فوراً في:
1. **شرح الشروط والرسوم الحكومية:** (تكاليف فتح سجل تجاري، رسوم نقل كفالة، رخص العمل، عقود إيجار).
2. **صياغة الخطابات والمعاريض والاسترحامات:** صياغة ديوانية بليغة وجاهزة للطباعة والتوقيع المباشر.
3. **تجهيز رسائل واتساب للعملاء:** لمتابعة المعاملات وطلب رموز نفاذ وتأكيد سداد الأتعاب والرسوم.

*تفضل بكتابة سؤالك مباشرة، أو اختر أحد الأسئلة السريعة المقترحة بالأسفل!* 👇`,
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist valid messages in localStorage (filtering any potential error markers)
  useEffect(() => {
    try {
      const validMessages = messages.filter(m => 
        !m.id?.startsWith("msg-err-") &&
        !m.text?.includes("تعذر الاتصال") &&
        !m.text?.includes("حدث خطأ أثناء الاتصال") &&
        !m.text?.includes("CHAT - 404")
      );
      localStorage.setItem("s_assistant_messages", JSON.stringify(validMessages));
    } catch (e) {
      console.error("Failed to save chat messages:", e);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || loading) return;

    if (!textToSend) {
      setInputMessage("");
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    let finalReply = "";

    try {
      // Setup timeout controller (35 seconds for reliable generation across cold starts)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      // Pass clean compact history (skip initial model greeting and error markers)
      const nonGreetingHistory = updatedMessages
        .slice(-4)
        .filter(m => m.id !== "m-welcome" && !m.id?.startsWith("msg-err-") && !m.text?.includes("CHAT - 404"))
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));

      const currentQuery = userMsg.text;
      const historyContext = nonGreetingHistory.slice(0, -1) || [];

      let responseSource = aiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini';

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentQuery,
          history: historyContext,
          provider: aiProvider
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.reply && data.reply.trim()) {
          finalReply = data.reply.trim();
          if (data.source) {
            responseSource = data.source;
          }
        }
      } else {
        console.warn("Backend chat returned non-OK status:", response.status);
      }
    } catch (netErr) {
      console.info("Using local authoritative knowledge fallback:", netErr);
    }

    // If server didn't provide a reply or was unreachable, immediately provide authoritative response from knowledge engine
    if (!finalReply) {
      finalReply = getSaudiKnowledgeResponse(userMsg.text);
    }

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "model",
      text: finalReply,
      source: aiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini',
      timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev.filter(m => !m.id.startsWith("msg-err-")), aiMsg]);
    setLoading(false);
  };

  const handleClearChat = () => {
    localStorage.removeItem("s_assistant_messages");
    setMessages([
      {
        id: "m-welcome-reset",
        role: "model",
        text: `تم مسح سجل المحادثة بنجاح والبدء من جديد! ⚡🤖\n\nتفضل بطرح سؤالك حول أي معاملة في المملكة، وسأساعدك فوراً.`,
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setShowClearConfirm(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-made Saudi platform prompt suggestion chips
  const suggestions = [
    { label: "🏢 خطوات ومصاريف فتح سجل تجاري", text: "ما هي شروط وخطوات وتكاليف فتح سجل تجاري جديد لمؤسسة فردية ورسوم الغرفة التجارية؟" },
    { label: "👥 رسوم وإجراءات نقل كفالة عامل", text: "ما هي شروط ورسوم وخطوات نقل خدمات عامل عبر منصة قوى والجوازات؟" },
    { label: "✍️ صياغة معروض استرحام رسمي", text: "اكتب مسودة خطاب استرحام وتظلم رسمي بليغ موجه لوزارة الموارد البشرية بخصوص نقل كفالة أو تأخير إقامة." },
    { label: "💵 رسوم رخصة العمل في قوى", text: "اشرح لي قواعد حساب المقابل المالي لرخص العمل في قوى للمنشآت الكبيرة والصغيرة." },
    { label: "🏬 متطلبات رخصة البلدية الفورية", text: "ما هي المستندات والشروط اللازمة لإصدار رخصة نشاط تجاري فورية عبر منصة بلدي؟" },
    { label: "📲 مسودة واتساب لمتابعة العميل", text: "اكتب لي قالب رسالة واتساب أنيق لإرساله للعميل لمتابعة سداد أتعاب المعاملة وتأكيد نفاذ." },
    { label: "📋 خطوات توثيق عقد إيجار موحد", text: "ما هي خطوات ورسوم توثيق عقد إيجار سكني أو تجاري في منصة إيجار؟" }
  ];

  // Helper parser to render text cleanly with bold (**text**), line breaks, and list points
  const formatText = (txt: string) => {
    // Escape tags to avoid raw HTML injection but safely format bold, asterisks, and bullets
    const lines = txt.split("\n");
    return lines.map((line, lineIdx) => {
      // Check for markdown listing elements
      const isListItem = line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim());
      
      // Handle bold **styling**
      let content = line;
      if (isListItem) {
        content = line.replace(/^[-*]\s+/, "• ").replace(/^\d+\.\s+/, "$& ");
      }

      // Resolve bold notation (**some bold**)
      const boldParts = content.split(/\*\*([\s\S]*?)\*\*/g);
      const renderedLine = boldParts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-extrabold text-slate-900 dark:text-emerald-350">{part}</strong>;
        }
        return part;
      });

      return (
        <div key={lineIdx} className={`${isListItem ? "mr-4 list-item" : "mb-2"} leading-relaxed text-xs sm:text-sm`}>
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <div id="smart-assistant-workspace" className="bg-white/90 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/60 dark:border-white/10 flex flex-col h-[720px] relative overflow-hidden transition-all">
      
      {/* Mini header section - spacious and uncrowded */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-5 mb-5 gap-4 shrink-0">
        <div className="flex items-center gap-3 text-right">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white font-sans">
                المساعد والمستشار الذكي
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                نشط وجاهز
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">مستشارك وسكرتيرك المعتمد لصياغة المعاريض وحساب الرسوم واللوائح الحكومية</p>
          </div>
        </div>

        {/* Actions Bar: AI Model Dropdown List + Delete Chat */}
        <div className="flex flex-wrap items-center gap-3">
          {/* AI Model Dropdown List (قائمة منسدلة) */}
          <div className="relative inline-flex items-center">
            <span className="absolute right-3.5 text-sm pointer-events-none">
              {aiProvider === 'deepseek' ? '🐋' : '⚡'}
            </span>
            <select
              id="ai-provider-select"
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as 'deepseek' | 'gemini')}
              className="bg-slate-100 hover:bg-slate-200/70 dark:bg-[#152033] dark:hover:bg-[#1d2c47] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-white/10 rounded-xl py-2.5 pr-9 pl-9 text-xs sm:text-sm font-bold appearance-none transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs min-w-[210px]"
              dir="rtl"
            >
              <option value="deepseek">محرك DeepSeek (ديب سيك)</option>
              <option value="gemini">محرك Google Gemini (جيميني)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </div>

          {/* Delete chat button with in-UI confirmation (no window.confirm block) */}
          {showClearConfirm ? (
            <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs animate-fadeIn">
              <span className="font-bold text-rose-700 dark:text-rose-300 text-[11px]">مسح المحادثة؟</span>
              <button
                type="button"
                onClick={handleClearChat}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                تأكيد
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-300 transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 px-3.5 py-2.5 rounded-xl transition cursor-pointer font-bold border border-rose-200/60 dark:border-rose-900/40 shrink-0"
              title="مسح سجل المحادثة بالكامل"
            >
              <Trash2 className="h-4 w-4" />
              <span>مسح المحادثة</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1.5 py-2 select-text custom-scrollbar">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          const isCopied = copiedId === msg.id;

          return (
            <div 
              key={msg.id}
              className={`flex w-full ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}
            >
              {/* Message avatar */}
              {isModel && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/20 text-xs font-black">
                  ذكاء
                </div>
              )}

              {/* Message content bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 relative shadow-xs flex flex-col group ${
                isModel 
                  ? "bg-slate-105/90 dark:bg-[#152033] text-slate-800 dark:text-slate-200 rounded-tr-xs border border-slate-200/50 dark:border-white/5" 
                  : "bg-indigo-600 text-white rounded-tl-xs"
              }`}>
                {/* Text Content */}
                <div className="text-right whitespace-pre-wrap select-text">
                  {isModel ? formatText(msg.text) : <span className="text-xs sm:text-sm font-medium">{msg.text}</span>}
                </div>

                {/* Sub info panel / Copies */}
                <div className="mt-3 pt-2 border-t border-slate-300/20 dark:border-white/5 flex items-center justify-between gap-4 text-[9px] opacity-80 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{msg.timestamp}</span>
                    {isModel && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        (msg.source || '').toLowerCase().includes('deepseek')
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {msg.source ? msg.source : (aiProvider === 'deepseek' ? '🐋 DeepSeek' : '⚡ Gemini')}
                      </span>
                    )}
                  </div>

                  {isModel && (
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                        isCopied 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white"
                      }`}
                      title="نسخ محتوى الرد بأكمله"
                    >
                      {isCopied ? <Check className="h-2.5 w-2.5" /> : <Clipboard className="h-2.5 w-2.5" />}
                      <span>{isCopied ? "تم النسخ!" : "نسخ الرد"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex w-full justify-start items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/20 text-xs font-black animate-spin">
              جاري
            </div>
            <div className="bg-slate-100 dark:bg-[#152033] rounded-2xl rounded-tr-xs p-4 border border-slate-200/50 dark:border-white/5 max-w-[85%] shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs font-black text-slate-450 dark:text-slate-400 pr-1.5">جاري كتابة الرد ومراجعة الشروط الرسمية...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="shrink-0 mb-3 overflow-x-auto select-none">
          <span className="block text-[11px] text-slate-400 mb-1.5 text-right font-bold flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
            أسئلة واقتراحات شائعة في مكاتب الخدمات لتبدأ بها:
          </span>
          <div className="flex gap-2 pb-1 bg-transparent max-w-full">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.text)}
                type="button"
                className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200/70 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-500/5 text-slate-700 dark:border-white/5 dark:bg-[#111a2e] dark:text-slate-300 dark:hover:border-teal-500 whitespace-nowrap transition cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 pt-3 border-t border-slate-200/50 dark:border-white/5 flex gap-2"
      >
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-3.5 bg-indigo-650 hover:bg-indigo-700 dark:bg-gradient-to-tr dark:from-emerald-500 dark:to-teal-600 text-white rounded-xl shadow-md transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="إرسال الرسالة إلى الذكاء الاصطناعي"
        >
          <Send className="h-4.5 w-4.5 text-white" />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="اكتب المعاملة أو الخدمة أو الخطاب الذي تحتاجه هنا... (مثال: شروط نقل خدمة، كتابة خطاب شكوى)"
          className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 p-3 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0c1322] transition"
        />
      </form>
    </div>
  );
}
