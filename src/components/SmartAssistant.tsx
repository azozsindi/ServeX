import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Clipboard, Check, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export default function SmartAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("s_assistant_messages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Return a beautiful welcoming message from the AI Saudi General Services Assistant
    return [
      {
        id: "m-welcome",
        role: "model",
        text: `أهلاً بك في **المساعد الذكي لمكتب الخدمات العامة**! ⚡🤖

أنا دليلك ومساعدك الرقمي في كافة الإجراءات والخدمات الالكترونية الحكومية في المملكة العربية السعودية.

يمكنني تقديم المساعدة الفورية لك في:
1. **شرح وتوضيح شروط** ومعاملات منصة (أبشر، قوى، ناجز، مساند، مقيم، بلدي، إلخ).
2. **صياغة الخطابات الرسمية** والخطابات الإدارية بأسلوب ديواني فخم واحترافي موجه لأي جهة تفضلها.
3. **تجهيز وتعديل رسائل واتساب ورسائل متابعة العملاء** للحفاظ على تواصل منظم وتأكيد المعاملات وسداد الرسوم.

*كيف يمكنني مساعدتك اليوم؟ يمكنك كتابة سؤالك مباشرة أو تجربة أحد الاقتراحات السريعة بالأسفل!* 👇`,
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

  // Persist messages in localStorage
  useEffect(() => {
    localStorage.setItem("s_assistant_messages", JSON.stringify(messages));
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

    try {
      // Map history correctly for the server API - we pass the last 10 messages to keep context
      const chatHistoryForServer = updatedMessages
        .slice(-10) // Limit to last 10 messages for performance and tokens
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));

      // Pull the last user message as the query
      const currentQuery = userMsg.text;
      const historyContext = chatHistoryForServer.slice(0, -1) || [];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentQuery,
          history: historyContext
        }),
      });

      if (!response.ok) {
        throw new Error("API Failure");
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "model",
        text: data.reply || "عذراً لم أتمكن من الحصول على الإجابة.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to fetch response: ", err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "model",
        text: "⚠️ حدث خطأ أثناء الاتصال بمساعد الذكاء الاصطناعي. يرجى التحقق من سعة الاتصال وخادم النظم والمفاتيح، ثم إعادة المحاولة.",
        timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("هل تريد بالتأكيد مسح كافة الرسائل والمحادثات السابقة البدء من جديد؟")) {
      localStorage.removeItem("s_assistant_messages");
      setMessages([
        {
          id: "m-welcome-reset",
          role: "model",
          text: `تم إعادة تهيئة المساعد الذكي! بنجاح. ⚡🤖

تفضل بطرح سؤالك حول أي معاملة في المملكة، أو اطلب صياغة خطاب وسأساعدك فوراً بفضل ذكاء Gemini الاصطناعي السحابي.`,
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-made Saudi platform prompt suggestion chips
  const suggestions = [
    { label: "📋 خطوات قيد عقد إيجار موحد", text: "ما هي شروط ومتطلبات وخطوات توثيق وتسجيل عقد إيجار سكني أو تجاري في منصة إيجار بالكامل؟" },
    { label: "✍️ صياغة خطاب استرحام وتظلم", text: "اكتب مسودة خطاب شكوى وتظلم رسمي في المملكة العربية السعودية موجه إلى وزارة الموارد البشرية بخصوص مخالفة رخصة عمل أو نقل خدمات منشأة بشكل متزن وبليغ." },
    { label: "💵 رسوم رخصة عمل قوى", text: "اشرح لي قواعد حساب رسوم رخصة العمل في منصة قوى للمنشآت الكبيرة والمتوسطة والمؤسسات الصغيرة بحسب عدد العمالة السعودية." },
    { label: "📲 مسودة واتساب لمتابعة معاملة", text: "اكتب لي قالب رسالة واتساب أنيق جداً لإرساله للعميل لمتابعته حول سداد رسوم نقل كفالة وتزويدنا برمز نفاذ أو الموافقة من حسابه في أبشر." },
    { label: "⚖️ طلب إصدار وكالة قضائية ناجز", text: "ما هي المتطلبات والشروط اللازمة لإصدار وإعداد وكالة لشخص آخر عبر منصة ناجز العدلية دون زيارة كتابة العدل؟" }
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
    <div id="smart-assistant-workspace" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 flex flex-col h-[650px] relative overflow-hidden">
      
      {/* Mini header section */}
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-2 text-right">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-xl shadow-sm flex items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5 font-sans">
              <span>المساعد الذكي للخدمات العامة (Gemini)</span>
            </h2>
            <p className="text-[11px] text-slate-400">مستشارك وسكرتيرك المضمون لصياغة المعاريض وفهم شروط المنصات الحكومية</p>
          </div>
        </div>

        <button 
          onClick={handleClearChat}
          className="text-xs flex items-center gap-1 text-rose-500 bg-rose-50 dark:bg-rose-955/20 dark:hover:bg-rose-900/40 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer font-bold"
          title="مسح سجل المحادثة بالكامل"
        >
          <RefreshCw className="h-3 w-3" />
          <span>مسح المحادثة</span>
        </button>
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
                  <span className="font-mono">{msg.timestamp}</span>

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
