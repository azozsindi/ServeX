import React, { useState } from 'react';
import { Task, Platform } from '../types';
import { ClipboardCheck, Plus, CheckCircle, Clock, Trash, AlertTriangle, Search, Landmark, Phone } from 'lucide-react';

interface TaskTrackerProps {
  tasks: Task[];
  platforms: Platform[];
  onSaveTasks: (tasks: Task[]) => void;
}

export default function TaskTracker({ tasks, platforms, onSaveTasks }: TaskTrackerProps) {
  const [clientSearch, setClientSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Custom Create States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      platformId: platformId || undefined,
      feeAmount: feeAmount >= 0 ? feeAmount : undefined,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('ar-SA') + ' - ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim() || undefined
    };

    onSaveTasks([newTask, ...tasks]);

    // reset Form
    setTitle('');
    setClientName('');
    setClientPhone('');
    setPlatformId('');
    setFeeAmount(0);
    setNotes('');
    setIsFormOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: Task['status']) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    onSaveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    onSaveTasks(tasks.filter(t => t.id !== id));
  };

  // Stats Calculations
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'processing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalOutstandingFees = tasks
    .filter(t => t.status !== 'canceled' && t.feeAmount)
    .reduce((sum, t) => sum + (t.feeAmount || 0), 0);

  // Filter lists
  const filteredTasks = tasks.filter(t => {
    // 1) Search for client by name or phone/mobile number (بحث عن عميل بالاسم أو رقم الجوال)
    const matchClient = !clientSearch.trim() || 
                        t.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
                        (t.clientPhone && t.clientPhone.includes(clientSearch));

    // 2) Quick transaction search (بحث عن معاملة بسرعة)
    const matchTransaction = !transactionSearch.trim() || 
                             t.title.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                             (t.notes && t.notes.toLowerCase().includes(transactionSearch.toLowerCase()));

    // 3) Filter by status (قيد التنفيذ / مكتملة / جديدة)
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchClient && matchTransaction && matchStatus;
  });

  const statusMap: Record<Task['status'], { label: string; color: string; badge: string }> = {
    pending: { label: 'جديدة', color: 'text-amber-600', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    processing: { label: 'قيد التنفيذ', color: 'text-indigo-600', badge: 'bg-indigo-505/10 text-indigo-600 dark:text-indigo-400 border-indigo-505/20' },
    completed: { label: 'مكتملة', color: 'text-emerald-600', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-405 border-emerald-500/20' },
    canceled: { label: 'ملغية', color: 'text-rose-600', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20' }
  };

  return (
    <div id="task-tracker-widget" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-white/5 relative overflow-hidden h-full">
      
      {/* 3 mini stat boxes in RTL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">بانتظار المعالجة اليوم</span>
            <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">{pendingCount} طلبات</span>
          </div>
          <Clock className="h-6 w-6 text-amber-500/40" />
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">المعاملات المنجزة</span>
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{completedCount} تم إنجازها</span>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-500/40" />
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">إجمالي مستحقات اليوم</span>
            <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">{totalOutstandingFees} ريال</span>
          </div>
          <Landmark className="h-6 w-6 text-indigo-500/40" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white font-sans">قائمة الطلبات الجارية اليوم</h2>
            <p className="text-xs text-slate-400">تابع مسار إنهاء معاملات العملاء، الكلف، والمنصات التابعة لتنظيم العمل بمكتبك</p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>طلب أو معاملة جديدة</span>
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleAddTask} className="mb-6 p-5 border border-slate-200/50 bg-slate-50/50 dark:bg-immersive-input-bg dark:border-white/5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">تسجيل بيانات المعاملة لمباشرتها</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">اسم المعاملة/الخدمة المطلوب:</label>
              <input
                type="text"
                required
                placeholder="مثال: تجديد إقامة سائق"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">اسم العميل:</label>
              <input
                type="text"
                required
                placeholder="مثال: سلمان بن سليم"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">رقم جوال العميل (اختياري):</label>
              <input
                type="tel"
                placeholder="مثال: 05XXXXXXXX"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">المنصة المرتبطة:</label>
              <select
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              >
                <option value="">لا توجد منصة محددة</option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">الرسوم/أتعاب الخدمة (ريال):</label>
              <input
                type="number"
                min="0"
                value={feeAmount}
                onChange={(e) => setFeeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white font-mono focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-450 dark:text-slate-350 mb-1">ملاحظة أو رقم سداد:</label>
              <input
                type="text"
                placeholder="رقم مرجعي أو أي ملحوظة"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/40 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              إلغاء المعاينة
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              إضافة الطلب
            </button>
          </div>
        </form>
      )}

      {/* Filter and Table of current Tasks */}
      <div className="space-y-4">
        {/* Powerful Dual Search Panel matching your requirements */}
        <div className="bg-slate-50 dark:bg-[#121b2b] p-4 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-3">
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="h-4 w-4 text-indigo-500" />
            <span>نظام البحث المطور للمكتب</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1) Search client by name or mobile number */}
            <div className="relative">
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-bold">البحث عن عميل (الاسم أو رقم الجوال):</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث باسم المراجع أو رقم هاتفه (مثال: سلمان)..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-immersive-input-bg dark:text-white py-2 pl-3 pr-9 outline-none focus:border-indigo-500 transition font-sans"
                />
                <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-550" />
              </div>
            </div>

            {/* 2) Quick transaction search */}
            <div className="relative">
              <label className="block text-[10px] text-slate-400 dark:text-slate-500 mb-1 font-bold">البحث عن معاملة بسرعة:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بنوع الإجراء أو الخدمة أو الملاحظة (مثال: كفالة)..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-immersive-input-bg dark:text-white py-2 pl-3 pr-9 outline-none focus:border-indigo-500 transition font-sans"
                />
                <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-550" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-[#152033]/20 p-2 rounded-xl border border-slate-200/30">
          <div className="text-[11px] text-slate-400 font-bold">
            💡 تستطيع تعبئة حقل واحد أو الحقلين معاً لتصفية دقيقة جداً.
          </div>

          {/* 3) Filter by status: قيد التنفيذ / مكتملة / جديدة */}
          <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
            {['all', 'pending', 'processing', 'completed', 'canceled'].map((stType) => {
              const tabLabels: Record<string, string> = {
                all: 'الكل',
                pending: 'جديدة (انتظار)',
                processing: 'قيد التنفيذ',
                completed: 'مكتملة',
                canceled: 'ملغية'
              };
              return (
                <button
                  key={stType}
                  onClick={() => setStatusFilter(stType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === stType
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#111a2f] dark:text-slate-300 dark:hover:bg-[#162137]'
                  }`}
                >
                  {tabLabels[stType]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders list table / cards representation */}
        <div className="overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-2xl bg-white/40 dark:bg-[#152033]/20 custom-scrollbar">
          <table className="w-full text-right text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-[#152033]/90 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5 font-black">
                <th className="p-4 min-w-[200px]">المعاملة</th>
                <th className="p-4 min-w-[160px]">اسم العميل</th>
                <th className="p-4 min-w-[140px]">المنصة</th>
                <th className="p-4 min-w-[120px]">الأتعاب/التكلفة</th>
                <th className="p-4 min-w-[145px]">تاريخ التقديم</th>
                <th className="p-4 min-w-[150px]">الحالة تواصل</th>
                <th className="p-4 text-center min-w-[80px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد معاملات جارية حالياً تطابق الفرز.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const currPlatform = platforms.find(p => p.id === task.platformId);
                  const statusProps = statusMap[task.status];
                  return (
                    <tr key={task.id} className="hover:bg-slate-100/30 dark:hover:bg-[#152033]/45 transition-colors">
                      <td className="p-4 vertical-align-middle">
                        <div className="font-bold text-slate-800 dark:text-white leading-snug break-words max-w-[260px]">{task.title}</div>
                        {task.notes && (
                          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 max-w-[260px] break-words leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-1 rounded border border-slate-100 dark:border-white/5" title={task.notes}>
                            📝 {task.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-4 vertical-align-middle">
                        <div className="font-bold text-slate-700 dark:text-slate-350 break-words max-w-[180px]">{task.clientName}</div>
                        {task.clientPhone && (
                          <a
                            href={`https://wa.me/${task.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] sm:text-xs text-emerald-500 flex items-center gap-1 mt-1 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{task.clientPhone}</span>
                          </a>
                        )}
                      </td>
                      <td className="p-4 vertical-align-middle">
                        {currPlatform ? (
                          <span className="font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1b2a45] border border-slate-200/30 text-xs">
                            {currPlatform.name}
                          </span>
                        ) : (
                          <span className="text-slate-350">-</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-200 vertical-align-middle text-xs sm:text-sm">
                        {task.feeAmount ? `${task.feeAmount} ريال` : <span className="text-slate-355 text-[10px] font-sans bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">غير محدد</span>}
                      </td>
                      <td className="p-4 text-[11px] text-slate-400 direction-rtl font-medium vertical-align-middle">
                        {task.createdAt}
                      </td>
                      <td className="p-4 font-semibold vertical-align-middle">
                        {/* Interactive Status Selector or Status badge */}
                        <div className="relative inline-block w-full">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                            className={`text-[11px] sm:text-xs font-black px-3 py-2 rounded-xl border outline-none cursor-pointer w-full text-right ${statusProps.badge}`}
                          >
                            <option value="pending" className="bg-white text-amber-600 dark:bg-[#152033] dark:text-amber-400">جديدة</option>
                            <option value="processing" className="bg-white text-indigo-600 dark:bg-[#152033] dark:text-indigo-400 font-medium">قيد التنفيذ</option>
                            <option value="completed" className="bg-white text-emerald-600 dark:bg-[#152033] dark:text-emerald-450">مكتملة</option>
                            <option value="canceled" className="bg-[#152033] text-rose-600 dark:bg-slate-800 dark:text-rose-450">ملغية</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-center vertical-align-middle">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-rose-550 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl transition cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash className="h-4 w-4 inline animate-pulse" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
