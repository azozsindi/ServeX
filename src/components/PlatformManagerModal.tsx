import React, { useState } from 'react';
import { Platform } from '../types';
import { X, Check } from 'lucide-react';

interface PlatformManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlatform: (platform: Omit<Platform, 'order'>) => void;
}

const COLOR_OPTIONS = [
  { label: 'أخضر زمردي', value: 'from-emerald-500 to-teal-650' },
  { label: 'أزرق سماوي', value: 'from-sky-500 to-blue-600' },
  { label: 'أزرق كحلي', value: 'from-indigo-650 to-blue-800' },
  { label: 'أرجواني بنفسجي', value: 'from-purple-500 to-indigo-700' },
  { label: 'ذهبي برتقالي', value: 'from-amber-500 to-orange-600' },
  { label: 'أحمر وردي', value: 'from-rose-500 to-red-650' },
  { label: 'فحمي غامق', value: 'from-slate-700 to-slate-900' },
  { label: 'فيروزي مائي', value: 'from-teal-600 to-cyan-700' },
];

export default function PlatformManagerModal({ isOpen, onClose, onAddPlatform }: PlatformManagerModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Platform['category']>('custom');
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    // Direct url validation
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    onAddPlatform({
      id: `platform-custom-${Date.now()}`,
      name: name.trim(),
      url: finalUrl,
      description: description.trim() || 'منصة مضافة يدوياً بواسطة مسؤول مكتب الخدمات العامة.',
      category,
      color,
    });

    // Reset fields
    setName('');
    setUrl('');
    setDescription('');
    setCategory('custom');
    setColor(COLOR_OPTIONS[0].value);
    onClose();
  };

  return (
    <div id="platform-manager-modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white/95 dark:bg-[#0d1527] backdrop-blur-lg p-5 sm:p-6 shadow-2xl border border-slate-200/50 dark:border-white/10 max-h-[90vh] overflow-y-auto z-10 animate-fade-in text-right pb-safe">
        
        {/* Mobile drag handle affordance */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/5">
          <div className="text-right">
            <h3 className="text-sm font-black text-slate-800 dark:text-white font-sans">إضافة منصة أو أداة جديدة للوحة التحكم</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">تخصيص الواجهة وإدراج الروابط الحكومية الاختيارية المفضلة لسرعة إنجاز معاملات عملائك</p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              • اسم المنصة أو الأداة (بالعربية):
            </label>
            <input
              type="text"
              required
              placeholder="مثال: منشآت، البنك التنموي الاجتماعي"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 font-bold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              • الرابط الرسمي للمنصة (على الويب):
            </label>
            <input
              type="text"
              required
              placeholder="مثال: sdb.gov.sa"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 font-mono transition"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              • التصنيف أو المجموعة:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Platform['category'])}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white transition"
            >
              <option value="chamber">غرفة تجارية (اتحاد الغرف والغرف بالمناطق)</option>
              <option value="government">رابط حكومي عام (أبشر، مقيم، إلخ)</option>
              <option value="employment">توظيف أو عمالة (قوى، مساند، إلخ)</option>
              <option value="business">تجارة وشركات (السجلات، الزكاة والجمارك)</option>
              <option value="justice">قضاء ومحاكم (ناجز، بوابة العدل)</option>
              <option value="custom">يدوي مضاف مخصص</option>
              <option value="other">روابط وأدوات أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              • نبذة أو شرح صغير لخطوات المنصة (اختياري):
            </label>
            <textarea
              placeholder="وصف مختصر لدعم الموظف أو للتذكير بفوائد هذه المنصة..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white transition"
            />
          </div>

          {/* Color Palettes Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              • تدرج الألوان المميز للبطاقة:
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`text-[10px] font-semibold p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    color === opt.value
                      ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200/50 bg-slate-50 text-slate-500 dark:bg-immersive-input-bg hover:bg-slate-100 dark:text-slate-350 dark:border-white/5'
                  }`}
                >
                  <div className={`h-3 w-8 rounded bg-gradient-to-l ${opt.value}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>أضف الآن للوحة تحكمي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
