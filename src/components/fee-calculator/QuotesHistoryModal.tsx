import React, { useState } from 'react';
import { SavedQuote } from '../../types';
import { 
  X, 
  Search, 
  FileText, 
  Eye, 
  Trash2, 
  Calendar, 
  Phone, 
  User, 
  CheckCircle, 
  Clock, 
  Filter,
  DollarSign,
  Tag
} from 'lucide-react';

interface QuotesHistoryModalProps {
  quotes: SavedQuote[];
  onSelectQuote: (quote: SavedQuote) => void;
  onUpdateQuoteStatus: (quoteId: string, newStatus: SavedQuote['status']) => void;
  onDeleteQuote: (quoteId: string) => void;
  onClose: () => void;
}

export default function QuotesHistoryModal({
  quotes,
  onSelectQuote,
  onUpdateQuoteStatus,
  onDeleteQuote,
  onClose
}: QuotesHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotes = quotes.filter((q) => {
    const qText = `${q.quoteNumber} ${q.clientName} ${q.clientPhone} ${q.serviceTitle}`.toLowerCase();
    const matchesSearch = qText.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SavedQuote['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            معتمد من العميل
          </span>
        );
      case 'pending_payment':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            بانتظار السداد
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            مكتمل ومسدد
          </span>
        );
      case 'canceled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            ملغي
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            مسودة
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#111a2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                سجل عروض الأسعار وكشوف الحسابات السابقة
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {quotes.length} عملية
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                مراجعة العروض الصادرة للعملاء، متابعة حالات السداد، وإعادة الطباعة والمشاركة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0 bg-slate-50/50 dark:bg-[#152033]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث برقم العرض، اسم العميل، أو رقم الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] pr-9 pl-3 py-2.5 outline-none focus:border-amber-500 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] px-3 py-2.5 outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="all">كافة الحالات</option>
              <option value="pending_payment">بانتظار السداد</option>
              <option value="approved">معتمد</option>
              <option value="completed">مكتمل</option>
              <option value="draft">مسودة</option>
              <option value="canceled">ملغي</option>
            </select>
          </div>
        </div>

        {/* Quotes List Table */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد عروض أسعار مطابقة للبحث
              </h3>
              <p className="text-xs text-slate-400">
                يمكنك إنشاء وتصدير عرض سعر جديد من أقسام الحاسبة لحفظه تلقائياً في هذا السجل
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-[#18233a] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-3">رقم العرض والتاريخ</th>
                    <th className="py-3 px-3">العميل والجوال</th>
                    <th className="py-3 px-3">نوع المعاملة</th>
                    <th className="py-3 px-3 text-left font-mono">الرسوم الحكومية</th>
                    <th className="py-3 px-3 text-left font-mono">أتعاب المكتب</th>
                    <th className="py-3 px-3 text-left font-mono">الإجمالي النهائي</th>
                    <th className="py-3 px-3 text-center">الحالة</th>
                    <th className="py-3 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-400">{q.quoteNumber}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>{q.createdAt}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{q.clientName || 'عميل عام'}</div>
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{q.clientPhone || '—'}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {q.serviceTitle}
                        <span className="block text-[10px] text-slate-400 font-normal">{q.items.length} بنود</span>
                      </td>

                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-700 dark:text-slate-300">
                        {q.totalGovernmentFees.toLocaleString()} ريال
                      </td>

                      <td className="py-3 px-3 text-left font-mono font-bold text-amber-600 dark:text-amber-400">
                        {q.totalOfficeFees.toLocaleString()} ريال
                      </td>

                      <td className="py-3 px-3 text-left font-mono font-black text-slate-900 dark:text-white">
                        {q.grandTotal.toLocaleString()} ريال
                      </td>

                      <td className="py-3 px-3 text-center">
                        <select
                          value={q.status}
                          onChange={(e) => onUpdateQuoteStatus(q.id, e.target.value as any)}
                          className="text-[11px] font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value="draft">مسودة</option>
                          <option value="pending_payment">بانتظار السداد</option>
                          <option value="approved">معتمد</option>
                          <option value="completed">مكتمل</option>
                          <option value="canceled">ملغي</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectQuote(q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                            title="معاينة وطباعة ومشاركة العرض"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من رغبتك في حذف هذا العرض من السجل؟')) {
                                onDeleteQuote(q.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="حذف العرض"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#152033] border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>إجمالي العروض المسجلة: <strong>{quotes.length}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
