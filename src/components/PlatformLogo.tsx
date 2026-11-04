import React from 'react';
import { 
  Shield, 
  Scale, 
  Cpu, 
  Users, 
  Compass, 
  Lock, 
  FileText, 
  Building2, 
  TrendingUp, 
  Globe, 
  Heart, 
  Truck, 
  UserCheck, 
  Briefcase, 
  PiggyBank, 
  Coins, 
  CheckSquare, 
  HelpCircle,
  FileCheck2,
  Bookmark,
  Landmark
} from 'lucide-react';

interface PlatformLogoProps {
  id: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlatformLogo({ id, name, size = 'md' }: PlatformLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-md'
  };

  const textSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs'
  };

  // Safe fallback letter
  const fallbackLetter = name ? name.trim().charAt(0) : 'م';

  // Render a beautifully crafted vector branded logo for each platform
  switch (id) {
    case 'absher-individuals':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#00a651] to-[#005c2e] p-0.5 flex items-center justify-center text-white relative shadow-sm overflow-hidden border border-emerald-400/25`}>
          {/* Subtle background circle effect */}
          <div className="absolute inset-1 rounded-lg border border-white/10 flex items-center justify-center flex-col shrink-0">
            <span className="font-extrabold tracking-tight font-sans text-xs scale-90 select-none">أبشر</span>
            <span className={`${textSizes[size]} font-black opacity-80 select-none -mt-1 text-[8px]`}>الأفراد</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400/20 blur-xs" />
        </div>
      );

    case 'absher-business':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#107c41] to-[#0a4d28] p-0.5 flex items-center justify-center text-white relative shadow-sm overflow-hidden border border-green-400/25`}>
          <div className="absolute inset-1 rounded-lg border border-white/10 flex items-center justify-center flex-col shrink-0">
            <span className="font-extrabold tracking-tight font-sans text-xs scale-90 select-none">أبشر</span>
            <span className={`${textSizes[size]} font-black text-amber-350 select-none -mt-1 text-[8px]`}>أعمال</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400/20 blur-xs" />
        </div>
      );

    case 'najiz':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0c4a6e] to-[#0284c7] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-sky-400/20 overflow-hidden`}>
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-sky-400/10" />
          <Scale className="h-4.5 w-4.5 text-sky-200" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-sky-100 select-none`}>ناجز</span>
        </div>
      );

    case 'qiwa':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-blue-400/20 overflow-hidden`}>
          <Cpu className="h-4.5 w-4.5 text-sky-200 animate-pulse" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-white select-none`}>قوى</span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-300/40" />
        </div>
      );

    case 'muqeem':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-indigo-400/20 overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:4px_4px] opacity-40" />
          <Users className="h-4.5 w-4.5 text-indigo-200" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-indigo-100 select-none`}>مقيم</span>
        </div>
      );

    case 'musaned':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#10b981] to-[#047857] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-emerald-400/20 overflow-hidden`}>
          <UserCheck className="h-4.5 w-4.5 text-emerald-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-emerald-55 select-none`}>مساند</span>
        </div>
      );

    case 'nafadh':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#b45309] to-[#15803d] p-0.5 flex flex-col items-center justify-center text-white relative shadow-sm border border-yellow-500/20 overflow-hidden`}>
          <div className="absolute inset-1 rounded-lg border border-yellow-400/20 bg-emerald-950/40 flex flex-col items-center justify-center">
            <Lock className="h-3 w-3 text-yellow-400" />
            <span className="text-[10px] font-black tracking-widest text-emerald-300">نفاذ</span>
          </div>
        </div>
      );

    case 'gosi':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-blue-600/25 overflow-hidden`}>
          <PiggyBank className="h-4.5 w-4.5 text-blue-200" />
          <span className="text-[9px] font-black mt-0.5 text-blue-105 tracking-tighter select-none">التأمينات</span>
        </div>
      );

    case 'mudad':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0f172a] to-[#020617] p-0.5 flex flex-col items-center justify-center text-white relative shadow-sm border border-emerald-500/30 overflow-hidden`}>
          <div className="absolute inset-1.5 rounded-lg border border-emerald-500/20 flex flex-col items-center justify-center bg-slate-900/80">
            <Coins className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[9px] font-extrabold text-white">مدد</span>
          </div>
        </div>
      );

    case 'balady':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0d9488] to-[#115e59] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-teal-400/25 overflow-hidden`}>
          <Building2 className="h-4.5 w-4.5 text-rose-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-teal-100 select-none`}>بلدي</span>
        </div>
      );

    case 'efaa':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#e11d48] to-[#be123c] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-rose-500/25 overflow-hidden`}>
          <Shield className="h-4.5 w-4.5 text-rose-200" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-rose-100 select-none`}>إيفاء</span>
        </div>
      );

    case 'commerce':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-amber-500/20 overflow-hidden`}>
          <Briefcase className="h-4.5 w-4.5 text-amber-200" />
          <span className="text-[9px] font-black text-amber-100 tracking-tighter select-none">و.التجارة</span>
        </div>
      );

    case 'zatca':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#334155] to-[#1e293b] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-slate-500/30 overflow-hidden`}>
          <div className="absolute inset-0 bg-yellow-500/5" />
          <FileText className="h-4.5 w-4.5 text-amber-400" />
          <span className="text-[8.5px] font-black scale-95 mt-0.5 text-slate-300 select-none">الزكاة والجمارك</span>
        </div>
      );

    case 'sehaty':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#ec4899] to-[#db2777] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-pink-400/20 overflow-hidden`}>
          <Heart className="h-4.5 w-4.5 text-pink-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-white select-none`}>صحتي</span>
        </div>
      );

    case 'spl':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#ea580c] to-[#0284c7] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-orange-400/25 overflow-hidden`}>
          <Truck className="h-4 w-4 text-orange-100 rotate-y-180" />
          <span className={`${textSizes[size]} font-extrabold text-white tracking-widest leading-none mt-0.5`}>سبل</span>
        </div>
      );

    case 'sbc':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0891b2] to-[#0369a1] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-cyan-400/20 overflow-hidden`}>
          <TrendingUp className="h-4.5 w-4.5 text-cyan-200" />
          <span className="text-[9px] font-black scale-90 mt-0.5 text-cyan-100 text-center leading-none">الأعمال السعودي</span>
        </div>
      );

    case 'citizen':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#10b981] to-[#1e3a8a] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-emerald-500/20 overflow-hidden`}>
          <div className="absolute top-[-5px] right-[-5px] w-6 h-6 rounded-full bg-emerald-400/10" />
          <Users className="h-4.5 w-4.5 text-emerald-200" />
          <span className="text-[8.5px] font-black -mt-0.5 text-emerald-50 select-none leading-none">حساب المواطن</span>
        </div>
      );

    case 'hrsd':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-emerald-500/20 overflow-hidden`}>
          <Globe className="h-4.5 w-4.5 text-emerald-200" />
          <span className="text-[8px] font-black mt-0.5 text-emerald-50 text-center leading-none">الموارد البشرية</span>
        </div>
      );

    case 'enjaz':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-teal-400/25 overflow-hidden`}>
          <FileCheck2 className="h-4.5 w-4.5 text-teal-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-teal-50 select-none`}>إنجاز</span>
        </div>
      );

    case 'etimad':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#854d0e] to-[#713f12] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-yellow-700/20 overflow-hidden`}>
          <Shield className="h-4.5 w-4.5 text-amber-200" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-yellow-100 select-none`}>اعتماد</span>
        </div>
      );

    case 'scfhs':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0d9488] to-[#1e40af] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-teal-500/20 overflow-hidden`}>
          <Heart className="h-4.5 w-4.5 text-teal-150 animate-pulse" />
          <span className="text-[8.5px] font-black -mt-0.5 text-slate-100 select-none leading-none">التخصّصات</span>
        </div>
      );

    case 'taqat':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-amber-500/25 overflow-hidden`}>
          <Briefcase className="h-4.5 w-4.5 text-amber-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-amber-50 select-none`}>طاقات</span>
        </div>
      );

    case 'visa-mofa':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0c5a30] to-[#16a34a] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-green-500/25 overflow-hidden`}>
          <Globe className="h-4.5 w-4.5 text-emerald-100" />
          <span className="text-[8.5px] font-black -mt-0.5 text-emerald-50 select-none leading-none">موقع الفيز</span>
        </div>
      );

    case 'taradhi':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0284c7] to-[#115e59] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-sky-500/20 overflow-hidden`}>
          <Scale className="h-4 w-4 text-sky-100" />
          <span className={`${textSizes[size]} font-black scale-90 -mt-0.5 text-sky-100 select-none`}>تراضي</span>
        </div>
      );

    case 'fsc':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#064e3b] to-[#042f2e] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-emerald-400/30 overflow-hidden`}>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-400/15" />
          <Landmark className="h-4.5 w-4.5 text-amber-300" />
          <span className="text-[7.5px] font-black -mt-0.5 text-emerald-100 select-none leading-none">اتحاد الغرف</span>
        </div>
      );

    case 'fsc-attest':
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#0d9488] to-[#115e59] p-1 flex flex-col items-center justify-center text-white relative shadow-sm border border-teal-400/30 overflow-hidden`}>
          <FileCheck2 className="h-4.5 w-4.5 text-amber-300" />
          <span className="text-[7.5px] font-black -mt-0.5 text-teal-100 select-none leading-none">تصديق الغرف</span>
        </div>
      );

    default: {
      if (id.startsWith('chamber-')) {
        const region = name.replace('غرفة', '').trim();
        return (
          <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#064e3b] to-[#0f172a] p-1 flex flex-col items-center justify-center text-white relative shadow-xs border border-emerald-500/25 overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
            <Landmark className="h-4 w-4 text-amber-300 shrink-0" />
            <span className="text-[7.5px] font-black mt-0.5 text-emerald-100 select-none truncate max-w-full px-0.5 text-center leading-none">
              {region}
            </span>
          </div>
        );
      }

      // Custom added platform logic or fallback
      return (
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-tr ${id.includes('custom') ? 'from-purple-500 to-indigo-650' : 'from-slate-450 to-slate-650'} p-1 flex flex-col items-center justify-center text-white relative shadow-xs font-black select-none border border-white/10`}>
          <Bookmark className="h-4.5 w-4.5 opacity-40 absolute top-1.5" />
          <span className="text-sm font-black mt-2 bg-white/20 px-2 py-0.5 rounded-md min-w-[20px] text-center">{fallbackLetter}</span>
        </div>
      );
    }
  }
}
