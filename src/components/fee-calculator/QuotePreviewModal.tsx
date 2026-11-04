import React, { useState } from 'react';
import { SavedQuote } from '../../types';
import { 
  X, 
  Printer, 
  Share2, 
  PhoneCall, 
  CheckCircle, 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  Copy,
  Save
} from 'lucide-react';

interface QuotePreviewModalProps {
  quote: SavedQuote;
  officeName?: string;
  onClose: () => void;
  onSaveQuote?: (quote: SavedQuote) => void;
}

export default function QuotePreviewModal({
  quote,
  officeName = 'مكتب الخدمات العامة الموحد',
  onClose,
  onSaveQuote
}: QuotePreviewModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Generate WhatsApp formatted text
  const generateWhatsAppText = () => {
    let t = `*🧾 كشف تكاليف وعرض سعر رسمي*\n`;
    t += `*🏛️ ${officeName}*\n`;
    t += `*رقم العرض:* ${quote.quoteNumber}\n`;
    t += `*التاريخ:* ${quote.createdAt}\n`;
    t += `*الصلاحية:* حتى ${quote.validUntil}\n`;
    if (quote.clientName) t += `*العميل الكريم:* ${quote.clientName}\n`;
    if (quote.clientPhone) t += `*رقم الجوال:* ${quote.clientPhone}\n`;
    t += `*نوع الخدمة:* ${quote.serviceTitle}\n`;
    t += `-------------------------------------------\n`;
    t += `*تفاصيل وبنود المعاملة:*\n`;

    quote.items.forEach((item, idx) => {
      t += `${idx + 1}. *${item.name}*\n`;
      t += `   • الجهة: ${item.entity}\n`;
      if (item.quantity > 1) t += `   • الكمية: ${item.quantity}\n`;
      t += `   • الرسوم الحكومية: ${item.totalGovernmentFee.toLocaleString()} ريال\n`;
      t += `   • أتعاب المكتب: ${item.totalOfficeFee.toLocaleString()} ريال\n`;
      if (item.discount > 0) t += `   • خصم البند: -${item.discount.toLocaleString()} ريال\n`;
    });

    t += `-------------------------------------------\n`;
    t += `🏛️ *إجمالي الرسوم الحكومية الرسمية:* ${quote.totalGovernmentFees.toLocaleString()} ريال\n`;
    t += `💼 *إجمالي أتعاب وإشراف المكتب:* ${quote.totalOfficeFees.toLocaleString()} ريال\n`;
    if (quote.totalDiscount > 0) {
      t += `🏷️ *إجمالي الخصومات:* -${quote.totalDiscount.toLocaleString()} ريال\n`;
    }
    if (quote.vatAmount > 0) {
      t += `📊 *ضريبة القيمة المضافة (15% على الأتعاب):* +${quote.vatAmount.toLocaleString()} ريال\n`;
    }
    t += `===========================================\n`;
    t += `💰 *المبلغ النهائي الإجمالي المطلوب:* *${quote.grandTotal.toLocaleString()} ريال سعودي*\n`;
    t += `===========================================\n\n`;
    if (quote.notes) {
      t += `📌 *ملاحظات وشروط:* ${quote.notes}\n\n`;
    }
    t += `_شاكرين ومقدرين ثقتكم الكريمة بنا. نرجو تأكيد السداد لنباشر إنجاز المعاملة فوراً._ 🙏✨`;
    return t;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    let cleanPhone = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    }
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveQuote) {
      onSaveQuote(quote);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111a2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
              <FileCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">معاينة عرض السعر وكشف التكاليف</h3>
              <p className="text-[11px] text-slate-400 font-mono">رقم العرض: {quote.quoteNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveQuote && (
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{savedSuccess ? 'تم الحفظ بالسجل!' : 'حفظ بالسجل'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-850 dark:text-slate-100 print:p-0 print:overflow-visible">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-200 dark:border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-md print:border print:border-slate-300">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                  {officeName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">
                  للخدمات الحكومية وتخليص المعاملات والأنظمة الإلكترونية المعتمدة
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>معتمد وموثق وفق الأنظمة واللوائح السعودية</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-left bg-slate-50 dark:bg-[#152033] print:bg-transparent p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 font-mono text-xs space-y-1">
              <div className="text-amber-600 dark:text-amber-400 font-black text-sm">
                {quote.quoteNumber}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                تاريخ الإصدار: {quote.createdAt}
              </div>
              <div className="text-rose-600 dark:text-rose-400 text-[11px] flex items-center gap-1 font-bold">
                <Clock className="h-3 w-3" />
                <span>صالح حتى: {quote.validUntil}</span>
              </div>
            </div>
          </div>

          {/* Client & Service Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200/60 dark:border-white/5 print:bg-slate-50 print:border-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">العميل الكريم:</span>
                <span className="font-bold text-slate-800 dark:text-white print:text-black">
                  {quote.clientName || 'عميل نقدي / عام'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">رقم الجوال:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white print:text-black" dir="ltr">
                  {quote.clientPhone || 'غير محدد'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">نوع المعاملة:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {quote.serviceTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Items Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/5 print:border-slate-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-[#18233a] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10 print:bg-slate-100">
                <tr>
                  <th className="py-3 px-3 text-center w-10">#</th>
                  <th className="py-3 px-4">البند والخدمة</th>
                  <th className="py-3 px-3">الجهة الحكومية</th>
                  <th className="py-3 px-3 text-center w-14">الكمية</th>
                  <th className="py-3 px-4 text-left font-mono">الرسوم الحكومية</th>
                  <th className="py-3 px-4 text-left font-mono">أتعاب المكتب</th>
                  <th className="py-3 px-4 text-left font-mono">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                {quote.items.map((item, idx) => {
                  const lineTotal = item.totalGovernmentFee + item.totalOfficeFee - item.discount;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white print:text-black">
                        {item.name}
                        {item.notes && <span className="block text-[10px] text-slate-400 font-normal">{item.notes}</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{item.entity}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{item.quantity}</td>
                      <td className="py-3 px-4 text-left font-mono font-bold text-slate-700 dark:text-slate-200">
                        {item.totalGovernmentFee.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span>
                      </td>
                      <td className="py-3 px-4 text-left font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.totalOfficeFee.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span>
                      </td>
                      <td className="py-3 px-4 text-left font-mono font-black text-slate-900 dark:text-white print:text-black">
                        {lineTotal.toLocaleString()} <span className="text-[10px] text-slate-400">ريال</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Notes & Terms Box */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <span>📌 الشروط والأحكام وملاحظات السداد:</span>
              </h4>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
                <li>الرسوم الحكومية مدفوعات رسمية مسددة للأنظمة (سداد، قوى، بلدي، إيجار) بفواتير مستقلة.</li>
                <li>يلزم تزويد المكتب بإشعار التحويل البنكي وتأكيد طلب نفاذ الوطني للبدء الفوري.</li>
                <li>صلاحية الأسعار الموضحة أعلاه سارية حتى التاريخ المحدد بعرض السعر.</li>
              </ul>
              {quote.notes && (
                <div className="pt-2 border-t border-amber-500/20 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ملاحظة إضافية: {quote.notes}
                </div>
              )}
            </div>

            {/* Calculations Total Sheet */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-slate-200 dark:border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                <span>مجموع الرسوم الحكومية الرسمية:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {quote.totalGovernmentFees.toLocaleString()} ريال
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                <span>مجموع أتعاب وسعي المكتب:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {quote.totalOfficeFees.toLocaleString()} ريال
                </span>
              </div>

              {quote.totalDiscount > 0 && (
                <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-sans font-bold">
                  <span>الخصم المطبق للعميل:</span>
                  <span className="font-mono">
                    -{quote.totalDiscount.toLocaleString()} ريال
                  </span>
                </div>
              )}

              {quote.vatAmount > 0 && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-sans">
                  <span>ضريبة القيمة المضافة ({quote.vatRate}% على الأتعاب):</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    +{quote.vatAmount.toLocaleString()} ريال
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-dashed border-slate-300 dark:border-white/10 flex justify-between items-center font-sans">
                <span className="text-sm font-black text-slate-900 dark:text-white print:text-black">
                  الإجمالي النهائي المستحق:
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {quote.grandTotal.toLocaleString()} <span className="text-xs">SAR</span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-[11px] text-slate-400 font-sans">
            <div>
              <span>المسؤول: </span>
              <strong className="text-slate-700 dark:text-slate-300">{quote.responsibleEmployee || 'الموظف المختص'}</strong>
            </div>
            <div>
              <span>الختم والاعتماد: ...........................................</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden on print) */}
        <div className="p-4 bg-slate-50 dark:bg-[#152033] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
              }`}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'تم نسخ النص للواتساب!' : 'نسخ نص الواتساب'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PhoneCall className="h-4 w-4" />
              <span>إرسال للعميل عبر الواتساب</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 transition cursor-pointer"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
