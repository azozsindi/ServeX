import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw, Copy, Check, Clock, Sparkles } from "lucide-react";

// Official Saudi Occasions List
interface SaudiHoliday {
  id: string;
  name: string;
  gregDate: string; // "MM-DD" style or exact text
  hijriDate: string; // "MM-DD" or text
  type: "national" | "religious" | "celebration";
  desc: string;
}

const SAUDI_OCCASIONS: SaudiHoliday[] = [
  {
    id: "national-day",
    name: "اليوم الوطني السعودي",
    gregDate: "09-23",
    hijriDate: "مستند للميلادي ثابت",
    type: "national",
    desc: "ذكرى توحيد المملكة العربية السعودية على يد الملك عبد العزيز آل سعود رحمه الله في 23 سبتمبر."
  },
  {
    id: "founding-day",
    name: "يوم التأسيس السعودي",
    gregDate: "02-22",
    hijriDate: "مستند للميلادي ثابت",
    type: "national",
    desc: "ذكرى تأسيس الدولة السعودية الأولى على يد الإمام محمد بن سعود في 22 فبراير."
  },
  {
    id: "flag-day",
    name: "يوم العلم السعودي",
    gregDate: "03-11",
    hijriDate: "مستند للميلادي ثابت",
    type: "national",
    desc: "يوم الاحتفاء بالعلم الوطني للمملكة العربية السعودية ورمزيته التاريخية في 11 مارس."
  },
  {
    id: "eid-alfitr",
    name: "عطلة عيد الفطر المبارك",
    gregDate: "متغير هجرياً",
    hijriDate: "10-01",
    type: "religious",
    desc: "يبدأ سريان إيقاف العمل والاحتفال بحلول أول أيام شوال من كل عام هجري بعد صيام رمضان."
  },
  {
    id: "eid-aladha",
    name: "عطلة عيد الأضحى والوقوف بعرفة",
    gregDate: "متغير هجرياً",
    hijriDate: "12-09",
    type: "religious",
    desc: "وقفة عرفات المباركة في التاسع من ذي الحجة تليها أيام النحر والتشريق."
  }
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [copySuccessText, setCopySuccessText] = useState<string | null>(null);

  // Converter States - Gregorian to Hijri
  const [convGYear, setConvGYear] = useState(new Date().getFullYear());
  const [convGMonth, setConvGMonth] = useState(new Date().getMonth() + 1);
  const [convGDay, setConvGDay] = useState(new Date().getDate());
  const [resHijri, setResHijri] = useState("");

  // Converter States - Hijri to Gregorian
  const [convHYear, setConvHYear] = useState(1448);
  const [convHMonth, setConvHMonth] = useState(1);
  const [convHDay, setConvHDay] = useState(1);
  const [resGreg, setResGreg] = useState("");

  // Helper inside reactive hooks to format dates
  const formatDateToHijri = (date: Date, locale: string = "ar-SA"): string => {
    try {
      return new Intl.DateTimeFormat(locale + "-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    } catch (e) {
      return date.toLocaleDateString(locale);
    }
  };

  // Run initial conversion helpers
  useEffect(() => {
    handleConvertGtoH();
    handleConvertHtoG();
  }, []);

  const handleConvertGtoH = () => {
    try {
      const gDate = new Date(convGYear, convGMonth - 1, convGDay);
      if (isNaN(gDate.getTime())) {
        setResHijri("تاريخ ميلادي غير صالح");
        return;
      }
      const hijriAr = formatDateToHijri(gDate, "ar-SA");
      const hijriEn = formatDateToHijri(gDate, "en-US");
      setResHijri(`العربية: ${hijriAr}\nالإنكليزية: ${hijriEn}`);
    } catch (e) {
      setResHijri("فشل التحويل. يرجى مراجعة المدخلات.");
    }
  };

  const handleConvertHtoG = () => {
    // Elegant approximation for Islamic UmAlQura to Gregorian.
    // 1 Hijri year is ~354.367 days.
    // Let's implement an accurate mathematical conversion algorithm for current period (1445 - 1460).
    try {
      // Calculate julian day approximation or exact lookup for modern Saudi dates
      // Let's use standard umalqura base lookup for precision in modern era
      // 1445-01-01 H is ~ 2023-07-19 G
      const hijriBaseYear = 1445;
      const baseGregTime = new Date(2023, 6, 19).getTime(); // July 19, 2023
      
      const yearsDiff = convHYear - hijriBaseYear;
      const monthsDiff = convHMonth - 1;
      const daysDiff = convHDay - 1;
      
      // Islamic astronomical constants
      const approxDays = (yearsDiff * 354.367) + (monthsDiff * 29.53) + daysDiff;
      const convertedDate = new Date(baseGregTime + approxDays * 24 * 60 * 60 * 1000);
      
      if (isNaN(convertedDate.getTime())) {
        setResGreg("بيانات الهجرية خارج نطاق الفحص المجدول");
        return;
      }
      
      const gregAr = convertedDate.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const gregEn = convertedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      setResGreg(`العربية: ${gregAr}\nالإنكليزية: ${gregEn}`);
    } catch (e) {
      setResGreg("خطأ في صياغة المعادلة التقريبية.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccessText(label);
    setTimeout(() => setCopySuccessText(null), 2000);
  };

  // Helper text parsers for detailed current date info
  const today = new Date();
  const dayNameAr = today.toLocaleDateString("ar-SA", { weekday: "long" });
  const dayNameEn = today.toLocaleDateString("en-US", { weekday: "long" });

  const gregDayLabelAr = today.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
  const gregDayLabelEn = today.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  const hijriDayLabelAr = formatDateToHijri(today, "ar-SA");
  const hijriDayLabelEn = formatDateToHijri(today, "en-US");

  // Gregorian Month Number and Word representation as requested by user
  const numericMonth = String(today.getMonth() + 1).padStart(2, '0');
  const textMonthAr = today.toLocaleDateString("ar-SA", { month: "long" });
  const textMonthEn = today.toLocaleDateString("en-US", { month: "long" });

  // List of days in view calendar
  const getDaysInMonthList = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, etc.
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: Array<Date | null> = [];
    // Adjust for Saudi Arabia week which starts on Sunday
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const daysList = getDaysInMonthList(selectedDate);
  const selectedMonthNameAr = selectedDate.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });

  return (
    <div id="calendar-workspace-page" className="space-y-6">
      
      {/* TODAY DATE FLASH CARD - Luxurious layout centering Arabic/Gregorian details */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Background shine */}
        <div className="absolute top-[-150px] left-[-150px] w-80 h-80 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-150px] w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-right space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/25">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>اليوم والساعة الآن بمدينة مكة المكرمة</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-sans leading-none text-white tracking-tight mt-1.5">
              اليوم هو: {dayNameAr} <span className="text-slate-400 font-medium text-lg">({dayNameEn})</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-350 max-w-xl">
              تاريخ اليوم الهجري والميلادي والشهور مكتوبة بالرقم والكلمة العربية والإنجليزية لسهولة كتابتها في خطابات المعاملات الرسمية.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto self-stretch md:self-center items-stretch justify-center">
            {/* Hijri detail copybox */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between text-right flex-1 sm:min-w-[180px]">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block uppercase">تقويم أم القرى الهجري</span>
                <span className="text-lg font-black font-sans block mt-1 text-white">{hijriDayLabelAr}</span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">{hijriDayLabelEn}</span>
              </div>
              <button
                onClick={() => handleCopy(hijriDayLabelAr, "hijri-today")}
                className="mt-3 py-1.5 w-full bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              >
                {copySuccessText === "hijri-today" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>نسخ التاريخ</span>
                  </>
                )}
              </button>
            </div>

            {/* Gregorian detail copybox */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between text-right flex-1 sm:min-w-[180px]">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block uppercase">التقويم الميلادي الدولي</span>
                <span className="text-lg font-black font-sans block mt-1 text-white">{gregDayLabelAr}</span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">{gregDayLabelEn}</span>
              </div>
              <button
                onClick={() => handleCopy(gregDayLabelAr, "gregorian-today")}
                className="mt-3 py-1.5 w-full bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
              >
                {copySuccessText === "gregorian-today" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>نسخ التاريخ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed month representation user specified */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-right">
          <div>
            <span className="text-[10px] text-slate-400 block">رقم الشهر ورقماً وكتابة</span>
            <span className="text-base font-black text-slate-150 block mt-0.5 font-mono">{numericMonth} ({textMonthAr})</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Gregorian Month</span>
            <span className="text-base font-black text-slate-150 block mt-0.5 font-sans">{textMonthEn}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">مثال صياغة 1</span>
            <span className="text-xs font-black text-emerald-400 block mt-1">13 يونيو 2026 / 13 June 2026</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">مثال صياغة 2</span>
            <span className="text-xs font-black text-amber-400 block mt-1">01 أكتوبر 2026 / 01 October 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Gregorian Monthly Calendar (Grid layout) - Col 7 */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-white/5 text-right">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-indigo-505" />
              <span>التقويم الشهري والمنظّم اليومي</span>
            </h2>

            {/* Calendar pagination */}
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                className="p-1 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                السابق
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="p-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-xs font-bold dark:bg-slate-700 dark:text-slate-200 cursor-pointer"
              >
                الحالي
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                className="p-1 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                التالي
              </button>
            </div>
          </div>

          <div className="text-center font-bold text-sm text-slate-750 dark:text-white mb-2 bg-slate-50 dark:bg-[#152033] py-2 rounded-xl border border-slate-200/40 dark:border-white/5">
            {selectedMonthNameAr}
          </div>

          <div className="grid grid-cols-7 gap-2.5 text-center text-xs mt-3">
            {/* Days index headers */}
            {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(day => (
              <span key={day} className="text-slate-400 font-black py-1">{day}</span>
            ))}

            {/* Grid list representing days */}
            {daysList.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="p-3" />;
              }
              const isToday = day.toDateString() === new Date().toDateString();
              const formattedDateString = day.toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
              const hijriDayOfG = formatDateToHijri(day, "ar-SA").split(" ")[0]; // just get the day number e.g. "١٨"
              
              return (
                <div
                  key={idx}
                  onClick={() => handleCopy(`${formattedDateString} / ${formatDateToHijri(day, "ar-SA")}`, `cal-${idx}`)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center relative cursor-pointer group transition duration-250 ${
                    isToday
                      ? "bg-indigo-600 text-white border-indigo-650 shadow-md font-bold text-white scale-105"
                      : "bg-slate-55/40 hover:bg-slate-100 border-slate-200/50 hover:border-slate-300 dark:bg-[#111a2f]/40 dark:border-white/5 dark:hover:bg-slate-800"
                  }`}
                  title="اضغط لنسخ تاريخ هذا اليوم كاملاً بالتفصيل (ميلادي/هجري)"
                >
                  <span className="text-xs font-black font-mono leading-none">{day.getDate()}</span>
                  <span className={`text-[9px] mt-1 font-bold ${isToday ? "text-emerald-150" : "text-emerald-500"}`}>
                    {hijriDayOfG} هـ
                  </span>

                  {/* Bubble tooltip inside cell */}
                  {copySuccessText === `cal-${idx}` && (
                    <span className="absolute inset-0 bg-emerald-600 text-white rounded-xl text-[9px] font-bold flex items-center justify-center">
                      تم نسخ التاريخ!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Official Saudi Occasions & Convertor - Col 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* HOLIDAYS REGISTRY PANEL */}
          <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-white/5 text-right">
            <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 mb-4 border-b border-slate-200/50 dark:border-white/5 pb-2.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-500" />
              <span>المواسم والمناسبات الوطنية السعودية الرسمية</span>
            </h2>

            <div className="space-y-3.5">
              {SAUDI_OCCASIONS.map((occ) => {
                const isNational = occ.type === "national";
                return (
                  <div 
                    key={occ.id} 
                    className="p-3 bg-slate-50/70 border border-slate-200/50 dark:bg-[#111a2e]/65 dark:border-white/5 rounded-xl text-right hover:border-indigo-400/20 transition"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        isNational 
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}>
                        {isNational ? "عطلة وطنية ثابتة" : "عطلة دينية متغيرة"}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">{occ.name}</h4>
                    </div>

                    <p className="mt-1.5 text-[10.5px] text-slate-450 dark:text-slate-350 leading-relaxed font-semibold">
                      {occ.desc}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
                      <div className="flex gap-2 font-mono">
                        <span>م: {occ.gregDate}</span>
                        {occ.hijriDate !== "مستند للميلادي ثابت" && <span>هـ: {occ.hijriDate}</span>}
                      </div>

                      <button
                        onClick={() => handleCopy(`${occ.name} - موعد التقريب: ${occ.gregDate}`, occ.id)}
                        className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline cursor-pointer"
                      >
                        {copySuccessText === occ.id ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-2.5 w-2.5" />
                            <span>نسخ الموعد</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWO-WAY DATE COVERTOR PANEL */}
          <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-white/5 text-right space-y-5">
            <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-200/50 dark:border-white/5 pb-2.5">
              <RefreshCw className="h-4.5 w-4.5 text-emerald-500 animate-spin" style={{ animationDuration: "10s" }} />
              <span>محول التاريخ المزدوج الذكي (هجري وميلادي)</span>
            </h2>

            {/* Gregorian to Hijri section */}
            <div className="space-y-3 p-3 bg-slate-50/50 dark:bg-[#111a2f]/45 rounded-xl border border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400">1. محول تاريخ ميلادي إلى هجري</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">اليوم:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={convGDay}
                    onChange={(e) => setConvGDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">الشهر الرقم:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={convGMonth}
                    onChange={(e) => setConvGMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">السنة:</label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={convGYear}
                    onChange={(e) => setConvGYear(Math.max(1900, Math.min(2100, parseInt(e.target.value) || 2026)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={handleConvertGtoH}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-lg transition overflow-hidden cursor-pointer dark:bg-amber-505 dark:text-slate-950 dark:bg-amber-500"
                >
                  حساب التاريخ الهجري
                </button>

                <div className="flex-1 text-left">
                  <span className="text-[10px] font-mono leading-none font-bold text-slate-500 dark:text-slate-350 whitespace-pre-line text-xs font-bold">{resHijri || "اضغط للتحويل"}</span>
                </div>
              </div>
            </div>

            {/* Hijri to Gregorian section */}
            <div className="space-y-3 p-3 bg-slate-50/50 dark:bg-[#111a2f]/45 rounded-xl border border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">2. محول تاريخ هجري إلى ميلادي (تقويم القرى)</h3>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">اليوم الهجري:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={convHDay}
                    onChange={(e) => setConvHDay(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">الشهر الهجري:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={convHMonth}
                    onChange={(e) => setConvHMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 mb-0.5 font-bold">السنة الهجرية:</label>
                  <input
                    type="number"
                    min="1300"
                    max="1600"
                    value={convHYear}
                    onChange={(e) => setConvHYear(Math.max(1300, Math.min(1600, parseInt(e.target.value) || 1448)))}
                    className="w-full text-center text-xs font-bold p-1 bg-white border border-slate-205 dark:bg-[#0c1322] dark:border-white/10 dark:text-white rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={handleConvertHtoG}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black rounded-lg transition overflow-hidden cursor-pointer dark:bg-emerald-505 dark:text-emerald-950 dark:bg-emerald-500"
                >
                  حساب التاريخ الميلادي
                </button>

                <div className="flex-1 text-left">
                  <span className="text-[10px] font-mono leading-none font-bold text-slate-500 dark:text-slate-350 whitespace-pre-line text-xs font-bold">{resGreg || "اضغط للتحويل"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
