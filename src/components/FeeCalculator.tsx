import React, { useState, useEffect } from 'react';
import { FEE_CATEGORIES } from '../data/initialData';
import { FeeCategory, ServiceFee } from '../types';
import { Calculator, Share2, Clipboard, CheckCircle, HelpCircle, Landmark } from 'lucide-react';

export default function FeeCalculator() {
  const [categories, setCategories] = useState<FeeCategory[]>(FEE_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(FEE_CATEGORIES[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [variableQuantity, setVariableQuantity] = useState<number>(1);
  const [officeFee, setOfficeFee] = useState<number>(100); // Standard office commission
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Get active services
  const activeCategory = categories.find(c => c.id === selectedCategory);
  const activeService = activeCategory?.services.find(s => s.id === selectedServiceId) || activeCategory?.services[0];

  // Adjust inputs on category shift
  useEffect(() => {
    if (activeCategory && activeCategory.services.length > 0) {
      setSelectedServiceId(activeCategory.services[0].id);
      setVariableQuantity(1);
    }
  }, [selectedCategory]);

  if (!activeService) return null;

  // Calculate the government dues
  const baseFee = activeService.baseFee;
  const multiplier = activeService.variableMultiplier || 0;
  
  // Custom sponsorship transfer calculation logic
  let calculatedGovFee = baseFee;
  if (activeService.id === 'transfer-sponsorship') {
    // 2000 for 1st time, 4000 for 2nd time, 6000 for 3rd time
    if (variableQuantity === 2) {
      calculatedGovFee = 4000;
    } else if (variableQuantity >= 3) {
      calculatedGovFee = 6000;
    } else {
      calculatedGovFee = 2000;
    }
  } else if (multiplier > 0) {
    calculatedGovFee = baseFee + (multiplier * (variableQuantity - 1));
  }

  const grandTotal = calculatedGovFee + officeFee;

  // Format invoice text for copying to WhatsApp
  const generateShareableText = () => {
    return `*🧾 تفاصيل مستحقات المعاملة الحكومية*
---------------------------------------
*• الخدمة:* ${activeService.name}
*• تصنيف المعاملة:* ${activeCategory?.name || ''}
${activeService.variablesLabel ? `*• تفصيل المتابعة:* ${activeService.variablesLabel}: ${variableQuantity}\n` : ''}
*• الرسوم الحكومية المستحقة:* ${calculatedGovFee} ريال
*• أتعاب ومصروفات المكتب الدورية:* ${officeFee} ريال
---------------------------------------
*⚠️ الإجمالي المطلوب تحويله:* *${grandTotal} ريال سعودي*
---------------------------------------
_يرجى مراجعة وتأكيد السداد وتزويدنا بإيصال التحويل لنبدأ بالإجراء الفوري. شكراً لثقتكم بمكتبنا_ 🙏✨`;
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(generateShareableText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div id="fee-calculator-widget" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-white/5 h-full relative overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white">حاسبة الرسوم والأتعاب الحكومية</h2>
          <p className="text-xs text-slate-400">تقدير سريع للرسوم الرسمية وإضافة أتعاب مكتب الخدمات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selection side */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-550 dark:text-slate-350 mb-1.5">
              1. تصنيف المعاملات الرئيسي:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm border border-amber-400/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#1a263b] dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-550 dark:text-slate-350 mb-1.5">
              2. نوع المعاملة أو الخدمة:
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setVariableQuantity(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 transition"
            >
              {activeCategory?.services.map((serv) => (
                <option key={serv.id} value={serv.id}>
                  {serv.name} ({serv.baseFee} ريال)
                </option>
              ))}
            </select>
          </div>

          {/* Variables (e.g. number of years/dependents) */}
          {activeService.variablesLabel && (
            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-350 mb-1.5">
                3. {activeService.variablesLabel}:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={variableQuantity}
                  onChange={(e) => setVariableQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center text-xs rounded-xl border border-slate-200 bg-slate-50 p-2 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono transition"
                />
                <span className="text-xs text-slate-400">
                  ({activeService.id === 'transfer-sponsorship' ? 'للمرة الأولى 2000، الثانية 4000، الثالثة 6000' : `الضرب × ${activeService.variableMultiplier} لكل وحدة إضافية`})
                </span>
              </div>
            </div>
          )}

          {/* Office Fee Commission */}
          <div>
            <label className="block text-xs font-semibold text-slate-550 dark:text-slate-350 mb-1.5">
              4. أتعاب مكتب الخدمات الخاص بك (SAR):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="5"
                value={officeFee}
                onChange={(e) => setOfficeFee(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-amber-500 font-mono transition"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
            </div>
          </div>
        </div>

        {/* Calculation Result & Copy Invoice Text Area */}
        <div className="flex flex-col justify-between bg-slate-50/50 dark:bg-[#152033] rounded-2xl p-5 border border-slate-200/50 dark:border-white/5">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">تفصيل التكلفة النهائية</h4>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                <span>الرسوم الحكومية الأساسية:</span>
                <span className="font-mono font-medium">{baseFee} ريال</span>
              </div>

              {activeService.variablesLabel && variableQuantity > 1 && (
                <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                  <span>إضافي ({variableQuantity - 1} × {activeService.variableMultiplier}):</span>
                  <span className="font-mono font-medium">+{calculatedGovFee - baseFee} ريال</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-200 pt-2 border-t border-dashed border-slate-200/60 dark:border-white/5">
                <span>مجموع الرسوم الحكومية:</span>
                <span className="font-mono">{calculatedGovFee} ريال</span>
              </div>

              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                <span>سعي/أتعاب خدمات المكتب:</span>
                <span className="font-mono font-medium text-emerald-600 dark:text-[#34d399]">{officeFee} ريال</span>
              </div>
            </div>

            {/* GRAND TOTAL */}
            <div className="mt-5 p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center flex items-center justify-between">
              <span className="text-sm font-bold text-amber-800 dark:text-amber-350">السعر الإجمالي المطلوب:</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {grandTotal} <span className="text-xs font-bold">ريال</span>
              </span>
            </div>
          </div>

          <div className="mt-5 text-right">
            <span className="block text-[11px] text-slate-400 mb-1">وصف موجز للمنصة لدقة السداد:</span>
            <p className="text-xs text-slate-550 dark:text-slate-300 italic mb-4 leading-relaxed bg-white dark:bg-[#0c1322] p-2.5 rounded-lg border border-slate-200/50 dark:border-white/5">
              ⚡ {activeService.description}
            </p>

            <button
              onClick={handleCopyInvoice}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                copySuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/10'
                  : 'bg-slate-900 hover:bg-black text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-slate-950 dark:hover:from-amber-400 dark:hover:to-orange-400'
              }`}
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 animate-bounce" />
                  <span>تم نسخ الفاتورة الجاهزة للإرسال!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>نسخ الفاتورة لإرسالها بالواتساب</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
