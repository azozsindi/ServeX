import React, { useState, useMemo } from 'react';
import {
  ENCYCLOPEDIA_ITEMS,
  ENCYCLOPEDIA_HOTLINES,
  ENCYCLOPEDIA_DEADLINES,
  ENCYCLOPEDIA_TROUBLESHOOT,
  EncyclopediaItem
} from '../data/encyclopediaData';
import {
  BookOpen,
  Search,
  ExternalLink,
  Copy,
  Check,
  Share2,
  PhoneCall,
  Clock,
  AlertTriangle,
  Building2,
  FileCheck2,
  Wrench,
  HelpCircle,
  PlusCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  Send,
  X
} from 'lucide-react';

interface ServiceEncyclopediaProps {
  officeName: string;
  onAddTask?: (title: string, clientName: string, notes: string) => void;
}

export default function ServiceEncyclopedia({ officeName, onAddTask }: ServiceEncyclopediaProps) {
  const [activeSection, setActiveSection] = useState<'all' | 'procedures' | 'deadlines' | 'hotlines' | 'troubleshoot'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('enc-comm-1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp Send Modal State
  const [whatsappModalItem, setWhatsappModalItem] = useState<EncyclopediaItem | null>(null);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  // Task creation toast/notice
  const [taskCreatedNotice, setTaskCreatedNotice] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'كافة المعاملات' },
    { id: 'commerce', label: 'التجارة والشركات' },
    { id: 'jawazat', label: 'الجوازات والإقامة' },
    { id: 'qiwa', label: 'قوى والعمل' },
    { id: 'balady', label: 'بلدي والتراخيص' },
    { id: 'zatca', label: 'الزكاة والضريبة' },
    { id: 'musaned', label: 'مساند والعمالة' },
    { id: 'ejar', label: 'إيجار والعقود' }
  ];

  // Filtering procedures
  const filteredItems = useMemo(() => {
    return ENCYCLOPEDIA_ITEMS.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const inTitle = item.title.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      const inAuthority = item.authority.toLowerCase().includes(q);
      const inSteps = item.steps.some(s => s.toLowerCase().includes(q));
      const inTips = item.expertTips.some(t => t.toLowerCase().includes(q));
      const inDocs = item.requiredDocs.some(d => d.toLowerCase().includes(q));

      return matchesCategory && (inTitle || inSummary || inAuthority || inSteps || inTips || inDocs);
    });
  }, [selectedCategory, searchQuery]);

  // Filtering Deadlines
  const filteredDeadlines = useMemo(() => {
    if (!searchQuery.trim()) return ENCYCLOPEDIA_DEADLINES;
    const q = searchQuery.trim().toLowerCase();
    return ENCYCLOPEDIA_DEADLINES.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.authority.toLowerCase().includes(q) ||
      d.penaltyAmount.toLowerCase().includes(q) ||
      d.legalRule.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtering Hotlines & SADAD
  const filteredHotlines = useMemo(() => {
    if (!searchQuery.trim()) return ENCYCLOPEDIA_HOTLINES;
    const q = searchQuery.trim().toLowerCase();
    return ENCYCLOPEDIA_HOTLINES.filter(h => 
      h.entity.toLowerCase().includes(q) ||
      h.phone.toLowerCase().includes(q) ||
      (h.sadadBillerCode && h.sadadBillerCode.includes(q)) ||
      h.notes.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtering Troubleshoot
  const filteredTroubleshoot = useMemo(() => {
    if (!searchQuery.trim()) return ENCYCLOPEDIA_TROUBLESHOOT;
    const q = searchQuery.trim().toLowerCase();
    return ENCYCLOPEDIA_TROUBLESHOOT.filter(t => 
      t.platform.toLowerCase().includes(q) ||
      t.errorCodeOrMessage.toLowerCase().includes(q) ||
      t.cause.toLowerCase().includes(q) ||
      t.solution.some(s => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!whatsappModalItem) return;
    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
    }

    let message = whatsappModalItem.clientWhatsAppTemplate;
    if (clientName.trim()) {
      message = message.replace('عزيزي العميل', `عزيزي العميل (${clientName.trim()})`);
    }
    // Add office signature
    message += `\n\n📌 صادر من: ${officeName || 'مكتب الخدمات العامة'}\nللتواصل والمتابعة المباشرة.`;

    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, '_blank');
    setWhatsappModalItem(null);
    setClientPhone('');
    setClientName('');
  };

  const handleCreateTaskFromItem = (item: EncyclopediaItem) => {
    if (onAddTask) {
      const taskTitle = `معاملة: ${item.title}`;
      const defaultNotes = `الجهة: ${item.authority}\nالرسوم: ${item.govFees}\nالمهام الأساسية:\n- ` + item.steps.slice(0, 3).join('\n- ');
      onAddTask(taskTitle, 'عميل جديد', defaultNotes);
      setTaskCreatedNotice(`تمت إضافة "${item.title}" مباشرة إلى قائمة المعاملات!`);
      setTimeout(() => setTaskCreatedNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" dir="rtl">
      {/* Toast Notice */}
      {taskCreatedNotice && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-slideUp">
          <Check className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-semibold">{taskCreatedNotice}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>موسوعة المعقّب الذكية المعتمدة • إصدار 1447هـ / 2026م</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              موسوعة ومرجع المعاملات الحكومية الشامل
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              كل ما يحتاجه موظف مكتب الخدمات والمعقّب في مكان واحد: شروط المعاملات، الرسوم الرسمية، المهل والغرامات النظامية، أكواد سداد، وحلول الأخطاء الشائعة مع إمكانية مشاركة الشروط عبر واتساب بنقرة واحدة!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              طباعة الدليل
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6 relative">
          <Search className="w-5 h-5 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أي معاملة، غرامة، كود سداد، أو خطأ... (مثال: حجز اسم، نقل كفالة، رخصة بلدي، كود 090، غرامة الإقامة)"
            className="w-full bg-slate-800/90 text-white pr-12 pl-4 py-3.5 rounded-xl border border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-inner placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Main Section Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
            activeSection === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          كافة الأقسام والموسوعة
        </button>

        <button
          onClick={() => setActiveSection('procedures')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
            activeSection === 'procedures'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          دليل المعاملات والشروط ({ENCYCLOPEDIA_ITEMS.length})
        </button>

        <button
          onClick={() => setActiveSection('deadlines')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
            activeSection === 'deadlines'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          رادار المهل والغرامات الحكومية ({ENCYCLOPEDIA_DEADLINES.length})
        </button>

        <button
          onClick={() => setActiveSection('hotlines')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
            activeSection === 'hotlines'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-blue-500" />
          أكواد سداد وأرقام الدعم ({ENCYCLOPEDIA_HOTLINES.length})
        </button>

        <button
          onClick={() => setActiveSection('troubleshoot')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
            activeSection === 'troubleshoot'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4 text-rose-500" />
          مصلح أخطاء المنصات ({ENCYCLOPEDIA_TROUBLESHOOT.length})
        </button>
      </div>

      {/* QUICK HIGHLIGHT METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">سداد المدفوعات الحكومية</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">كود 090</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">الجوازات والإقامات والتأشيرات</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">سداد وزارة التجارة</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">كود 013</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">السجلات وحجز الأسماء</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-950/40 border border-amber-100 dark:border-amber-900/50">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">مهلة تأخير الإقامة</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">3 أيام</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ثم غرامة 500 ريال أول مرة</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-950/40 border border-purple-100 dark:border-purple-900/50">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">صلاحية حجز الاسم التجاري</div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">60 يوماً</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">محمي بالنظام قبل الإلغاء</div>
        </div>
      </div>

      {/* SECTION 1: PROCEDURES & CHECKLISTS */}
      {(activeSection === 'all' || activeSection === 'procedures') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-500" />
              دليل الشروط والإجراءات الحكومية الميداني
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-normal">
                {filteredItems.length} معاملة
              </span>
            </h2>

            {/* Sub-category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">لم يتم العثور على معاملات مطابقة للبحث.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map(item => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-4 sm:p-5 cursor-pointer flex items-start sm:items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-750 transition"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                            {item.categoryLabel}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {item.authority}
                          </span>
                          {item.sadadCode && (
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono">
                              سداد: {item.sadadCode}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {item.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWhatsappModalItem(item);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 flex items-center gap-1.5 transition"
                          title="مشاركة مع العميل عبر واتساب"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">إرسال للعميل</span>
                        </button>

                        <div className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-700/60 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-850/40 space-y-5">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 block mb-1">الرسوم الحكومية:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.govFees}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 block mb-1">وقت التنفيذ:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{item.processingTime}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block mb-1">البوابة الرسمية:</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.portalName}</span>
                            </div>
                            <a
                              href={item.portalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                              title="فتح البوابة في نافذة جديدة"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>

                        {/* Prerequisites & Requirements */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-500" />
                            الشروط والمتطلبات الأساسية للرفع:
                          </h4>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pr-2">
                            {item.prerequisites.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Step-by-Step Procedure */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4 text-indigo-500" />
                            خطوات التنفيذ خطوة بخطوة في المنصة:
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {item.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expert Tips & Warning */}
                        {item.expertTips.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              تنبيهات وأسرار المعقّب لتفادي رفض المعاملة:
                            </h4>
                            <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-200 pr-2">
                              {item.expertTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action buttons row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const fullSummary = `📌 ${item.title}\nالجهة: ${item.authority}\nالرسوم: ${item.govFees}\n\nالشروط:\n- ` + item.prerequisites.join('\n- ') + `\n\nالخطوات:\n- ` + item.steps.join('\n- ');
                                copyToClipboard(fullSummary, `full-${item.id}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5"
                            >
                              {copiedId === `full-${item.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>تم النسخ!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>نسخ المتطلبات</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setWhatsappModalItem(item)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>إرسال واتساب للعميل</span>
                            </button>
                          </div>

                          {onAddTask && (
                            <button
                              type="button"
                              onClick={() => handleCreateTaskFromItem(item)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                              <span>تحويل إلى معاملة جارية في المكتب</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DEADLINES & PENALTIES RADAR */}
      {(activeSection === 'all' || activeSection === 'deadlines') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              رادار المهل النظامية والغرامات وتفادي الجزاءات
              <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-normal">
                {filteredDeadlines.length} حالة نظامية
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeadlines.map((dl, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                      {dl.authority}
                    </span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      مهلة: {dl.gracePeriod}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {dl.title}
                  </h3>

                  <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
                    <span className="font-bold text-rose-900 dark:text-rose-300 block mb-1">الغرامة المترتبة:</span>
                    <span className="text-rose-800 dark:text-rose-200 leading-relaxed font-semibold">{dl.penaltyAmount}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-300">القاعدة النظامية:</strong> {dl.legalRule}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300">
                  <span className="font-bold flex items-center gap-1 mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    كيف تحمي عميلك وتتجنب الغرامة؟
                  </span>
                  <span>{dl.howToAvoid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SADAD CODES & HOTLINES */}
      {(activeSection === 'all' || activeSection === 'hotlines') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-500" />
              دليل أكواد سداد وأرقام الدعم الفني المباشر
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-normal">
                {filteredHotlines.length} جهة حكومية
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotlines.map((h, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {h.code}
                    </span>
                    {h.sadadBillerCode && (
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                        سداد: {h.sadadBillerCode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {h.entity}
                  </h3>

                  <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">رقم الاتصال:</span>
                    <a
                      href={`tel:${h.phone.replace(/[^0-9]/g, '')}`}
                      className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {h.phone}
                    </a>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>أوقات الدوام: {h.hours}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60 leading-relaxed">
                  {h.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PLATFORM ERROR CODE TROUBLESHOOTER */}
      {(activeSection === 'all' || activeSection === 'troubleshoot') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-500" />
              مصلح المشكلات والأخطاء البرمجية الشائعة في المنصات
              <span className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-normal">
                {filteredTroubleshoot.length} حلول فورية
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {filteredTroubleshoot.map((tb, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    منصة: {tb.platform}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    رمز / نص الخطأ الشائع
                  </span>
                </div>

                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  "{tb.errorCodeOrMessage}"
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">سبب الخطأ:</strong> {tb.cause}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    خطوات الحل المؤكدة:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pr-2">
                    {tb.solution.map((sol, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        <span>{sol}</span>
                      </li>
                    ))}
                  </ul>

                  {tb.workaround && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-medium pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      💡 <strong>حل بديل سريع:</strong> {tb.workaround}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHATSAPP CLIENT MESSAGE MODAL */}
      {whatsappModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-500" />
                مشاركة شروط المعاملة مع العميل عبر واتساب
              </h3>
              <button
                onClick={() => setWhatsappModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  اسم العميل (اختياري للتخصيص):
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: أبو فهد، شركة الأفق..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  رقم جوال العميل (اختياري لفتح المحادثة المباشرة):
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="05XXXXXXXX أو 9665XXXXXXXX"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  معاينة نص الرسالة المعتمدة:
                </label>
                <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {whatsappModalItem.clientWhatsAppTemplate}
                  {`\n\n📌 صادر من: ${officeName || 'مكتب الخدمات العامة'}`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setWhatsappModalItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition"
              >
                <Send className="w-4 h-4" />
                فتح وإرسال عبر واتساب الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
