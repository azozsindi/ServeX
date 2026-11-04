import React from 'react';
import { Platform } from '../types';
import { ExternalLink, Trash, ChevronRight, ChevronLeft, ArrowUpRight } from 'lucide-react';
import PlatformLogo from './PlatformLogo';

interface PlatformCardProps {
  key?: React.Key;
  platform: Platform;
  isFirst: boolean;
  isLast: boolean;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onDelete: () => void;
}

export default function PlatformCard({
  platform,
  isFirst,
  isLast,
  onMoveForward,
  onMoveBackward,
  onDelete,
}: PlatformCardProps) {
  // Map standard colors to attractive gradients
  const gradientStyles = platform.color || 'from-teal-600 to-indigo-700';

  const categoryLabels: Record<string, string> = {
    government: 'حكومة وأفراد',
    employment: 'توظيف وعمل عقود',
    business: 'أعمال وتجارة وسجل',
    justice: 'قضاء وعدل ناجز',
    chamber: 'غرفة تجارية',
    other: 'خدمات سداد وبنود',
    custom: 'يدوي مضاف',
  };

  const categoryBadges: Record<string, string> = {
    government: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    employment: 'bg-indigo-505/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    business: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    justice: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    chamber: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    other: 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20',
    custom: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const getHostname = (urlStr: string) => {
    try {
      const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return u.hostname.replace('www.', '');
    } catch (e) {
      return urlStr.replace('https://', '').replace('http://', '').split('/')[0];
    }
  };

  return (
    <div
      id={`platform-card-${platform.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/80 dark:bg-immersive-card backdrop-blur-md p-4.5 shadow-xs border border-slate-200/50 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:shadow-teal-500/5 dark:hover:shadow-teal-500/10 hover:-translate-y-1"
    >
      {/* Visual Accent Corner Ribbon / Gradient Glow on hover */}
      <div className={`absolute top-0 right-0 h-1.5 w-full bg-gradient-to-l ${gradientStyles} opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute -inset-px bg-gradient-to-tr ${gradientStyles} rounded-2xl opacity-0 group-hover:opacity-4 transition-all duration-500 blur-md pointer-events-none`} />

      {/* Content */}
      <div className="mb-4 relative z-10 text-right">
        <div className="flex items-center justify-between gap-1.5">
          {/* Badge */}
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadges[platform.category] || categoryBadges.other}`}>
            {categoryLabels[platform.category] || platform.category}
          </span>
          
          {/* External Icon */}
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            title="الانتقال الفوري للمنصة الرسمية"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Logo and Name block */}
        <div className="flex items-center gap-3 mt-3">
          <PlatformLogo id={platform.id} name={platform.name} />
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
              {platform.name}
            </h3>
            <span className="block text-[10px] text-slate-400 font-mono tracking-tight truncate" dir="ltr">
              {getHostname(platform.url)}
            </span>
          </div>
        </div>

        {/* Description text */}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-350 line-clamp-2 leading-relaxed h-10 overflow-hidden">
          {platform.description || 'لا يوجد وصف مضاف لموقع هذه المنصة.'}
        </p>
      </div>

      {/* Card Action footer */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between relative z-10">
        {/* Sorting Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveBackward(); }}
            disabled={isFirst}
            title="نقل لليمين"
            className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg transition ${
              isFirst
                ? 'text-slate-100 dark:text-slate-800 cursor-not-allowed'
                : 'text-slate-400 hover:bg-slate-150 hover:text-slate-705 dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer active:scale-95'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-350 dark:text-slate-650 px-1">
            {platform.order}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveForward(); }}
            disabled={isLast}
            title="نقل لليسار"
            className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg transition ${
              isLast
                ? 'text-slate-100 dark:text-slate-800 cursor-not-allowed'
                : 'text-slate-400 hover:bg-slate-150 hover:text-slate-705 dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Open Direct Button & Delete option */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            title="حذف المنصة من لوحة التحكم"
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-350 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-450 transition cursor-pointer active:scale-95"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>

          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl text-white bg-slate-900 hover:bg-black dark:bg-teal-600 dark:hover:bg-teal-500 transition shadow-sm hover:shadow cursor-pointer active:scale-95"
          >
            <span>رابط</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
