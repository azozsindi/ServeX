import React, { useState } from 'react';
import { ServiceFeeItem } from '../../types';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  RotateCcw, 
  Search, 
  Check, 
  Lock, 
  Unlock,
  History,
  Save,
  DollarSign
} from 'lucide-react';

interface PriceManagementModalProps {
  services: ServiceFeeItem[];
  onUpdateServices: (updated: ServiceFeeItem[]) => void;
  onResetToDefaults: () => void;
  onClose: () => void;
  isLoggedIn?: boolean;
}

export default function PriceManagementModal({
  services,
  onUpdateServices,
  onResetToDefaults,
  onClose,
  isLoggedIn = false
}: PriceManagementModalProps) {
  // Authentication check: If already logged in, admin is unlocked; otherwise ask for master password
  const [isUnlocked, setIsUnlocked] = useState<boolean>(isLoggedIn);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Edit / Add Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceFeeItem>>({
    name: '',
    category: 'single',
    entity: '',
    governmentFee: 0,
    defaultOfficeFee: 100,
    calculationType: 'fixed',
    verificationStatus: 'verified',
    officialSource: '',
    officialSourceUrl: '',
    isActive: true,
    description: ''
  });

  // Selected Service History View
  const [selectedHistoryService, setSelectedHistoryService] = useState<ServiceFeeItem | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Aa@000a000' || adminPassword === 'azos') {
      setIsUnlocked(true);
      setAuthError(null);
    } else {
      setAuthError('كلمة مرور الإدارة غير صحيحة. يرجى التأكد وإعادة المحاولة.');
    }
  };

  const handleOpenAddForm = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      category: 'single',
      entity: 'الجهات الحكومية',
      governmentFee: 100,
      defaultOfficeFee: 100,
      calculationType: 'fixed',
      verificationStatus: 'verified',
      officialSource: 'المنصة الوطنية الموحدة my.gov.sa',
      officialSourceUrl: 'https://my.gov.sa/',
      isActive: true,
      description: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (serv: ServiceFeeItem) => {
    setEditingServiceId(serv.id);
    setFormData({ ...serv });
    setIsFormOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];

    if (editingServiceId) {
      // Update existing service and track price change
      const updatedList = services.map((s) => {
        if (s.id === editingServiceId) {
          const prevGovFee = s.governmentFee;
          const newGovFee = Number(formData.governmentFee) || 0;
          
          let history = s.priceChangeHistory ? [...s.priceChangeHistory] : [];
          if (prevGovFee !== newGovFee) {
            history.push({
              date: todayStr,
              previousGovFee: prevGovFee,
              newGovFee: newGovFee,
              changedBy: 'المدير العام'
            });
          }

          return {
            ...s,
            name: formData.name!.trim(),
            category: formData.category || s.category,
            entity: formData.entity?.trim() || s.entity,
            governmentFee: newGovFee,
            defaultOfficeFee: Number(formData.defaultOfficeFee) || 0,
            calculationType: formData.calculationType || s.calculationType,
            verificationStatus: formData.verificationStatus || s.verificationStatus,
            lastVerifiedAt: todayStr,
            officialSource: formData.officialSource?.trim() || s.officialSource,
            officialSourceUrl: formData.officialSourceUrl?.trim() || s.officialSourceUrl,
            isActive: formData.isActive ?? s.isActive,
            description: formData.description?.trim() || s.description,
            priceChangeHistory: history
          };
        }
        return s;
      });

      onUpdateServices(updatedList);
    } else {
      // Add new service
      const newService: ServiceFeeItem = {
        id: `srv-${Date.now()}`,
        name: formData.name!.trim(),
        category: formData.category || 'single',
        entity: formData.entity?.trim() || 'جهة حكومية',
        governmentFee: Number(formData.governmentFee) || 0,
        defaultOfficeFee: Number(formData.defaultOfficeFee) || 0,
        calculationType: formData.calculationType || 'fixed',
        verificationStatus: formData.verificationStatus || 'verified',
        lastVerifiedAt: todayStr,
        officialSource: formData.officialSource?.trim() || 'الجهة الحكومية المختصة',
        officialSourceUrl: formData.officialSourceUrl?.trim() || '',
        isActive: true,
        description: formData.description?.trim() || '',
        priceChangeHistory: [
          {
            date: todayStr,
            previousGovFee: 0,
            newGovFee: Number(formData.governmentFee) || 0,
            changedBy: 'المدير العام'
          }
        ]
      };

      onUpdateServices([newService, ...services]);
    }

    setIsFormOpen(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة من الدليل؟')) {
      const filtered = services.filter((s) => s.id !== id);
      onUpdateServices(filtered);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = services.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    onUpdateServices(updated);
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const matchesQuery = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.officialSource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#111a2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black">
              {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                لوحة إدارة الأسعار والتحقق من الرسوم الحكومية
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  خاصة بالإدارة
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                تعديل الرسوم الحكومية، أتعاب وسعي المكتب، ومصادر التوثيق وتواريخ التحقق
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

        {/* Content Body */}
        {!isUnlocked ? (
          /* Password Protection Gate */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                منطقة محمية لصلاحيات المدير
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يرجى إدخال كلمة مرور الإدارة لتعديل الرسوم الحكومية وتوثيق المصادر
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                placeholder="أدخل كلمة مرور الإدارة (Aa@000a000)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full text-center text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] p-3 text-slate-900 dark:text-white outline-none focus:border-amber-500"
                autoFocus
              />

              {authError && (
                <div className="text-xs text-rose-500 font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                الدخول لإدارة الأسعار
              </button>
            </form>
          </div>
        ) : (
          /* Main Price Management Interface */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            
            {/* Top Toolbar: Search, Category Filter, and Add Service Button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    placeholder="ابحث عن الخدمة، الجهة، أو المصدر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] pr-9 pl-3 py-2.5 outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#152033] px-3 py-2.5 outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="all">كافة الأقسام والأنشطة</option>
                  <option value="commercial">🏢 السجلات التجارية</option>
                  <option value="sponsorship">🔄 نقل الكفالة والعمالة</option>
                  <option value="iqama">🪪 الإقامات والتأشيرات</option>
                  <option value="work_permit">💼 رخص العمل والمقابل المالي</option>
                  <option value="single">⚡ خدمات فردية سريعة</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                  title="استعادة الرسوم الافتراضية الموثقة"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>استعادة المعتمد</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة خدمة جديدة</span>
                </button>
              </div>
            </div>

            {/* Price Change Audit Log Modal Popup (if clicked) */}
            {selectedHistoryService && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <History className="h-4 w-4" />
                    <span>سجل تغييرات الأسعار لـ: {selectedHistoryService.name}</span>
                  </h4>
                  <button
                    onClick={() => setSelectedHistoryService(null)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="divide-y divide-amber-500/20 max-h-36 overflow-y-auto">
                  {selectedHistoryService.priceChangeHistory && selectedHistoryService.priceChangeHistory.length > 0 ? (
                    selectedHistoryService.priceChangeHistory.map((hist, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-center text-[11px]">
                        <span>التاريخ: {hist.date} (بواسطة: {hist.changedBy})</span>
                        <span className="font-mono font-bold">
                          من {hist.previousGovFee} ريال ➔ إلى {hist.newGovFee} ريال
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 py-2">لا توجد تغييرات سابقة مسجلة لهذا البند.</div>
                  )}
                </div>
              </div>
            )}

            {/* Add / Edit Form Modal Inline */}
            {isFormOpen && (
              <form onSubmit={handleSaveService} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#152033] border border-amber-500/30 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-2">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Edit className="h-4 w-4 text-amber-500" />
                    <span>{editingServiceId ? 'تعديل الخدمة والرسوم' : 'إضافة خدمة جديدة إلى الدليل'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الخدمة:</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: إصدار ترخيص بلدي"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الجهة الحكومية:</label>
                    <input
                      type="text"
                      required
                      value={formData.entity || ''}
                      onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                      placeholder="وزارة التجارة / الجوازات / بلدي"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">القسم / التصنيف:</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none"
                    >
                      <option value="commercial">سجلات وشركات</option>
                      <option value="sponsorship">نقل كفالة</option>
                      <option value="iqama">إقامات وجوازات</option>
                      <option value="work_permit">رخص عمل ومقابل مالي</option>
                      <option value="single">خدمة سريعة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الرسم الحكومي الرسمي (SAR):</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formData.governmentFee}
                      onChange={(e) => setFormData({ ...formData, governmentFee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">أتعاب وسعي المكتب (SAR):</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formData.defaultOfficeFee}
                      onChange={(e) => setFormData({ ...formData, defaultOfficeFee: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 font-mono font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">طريقة الحساب:</label>
                    <select
                      value={formData.calculationType}
                      onChange={(e) => setFormData({ ...formData, calculationType: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none"
                    >
                      <option value="fixed">مبلغ ثابت لمرة واحدة</option>
                      <option value="annual">رسم سنوي (يضرب بالسنوات)</option>
                      <option value="per_worker">لكل عامل (يضرب بعدد العمال)</option>
                      <option value="monthly">شهري</option>
                      <option value="tiered">متدرج</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">حالة التوثيق الحكومي:</label>
                    <select
                      value={formData.verificationStatus}
                      onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none"
                    >
                      <option value="verified">✅ موثق ورسمي</option>
                      <option value="needs_review">⚠️ يحتاج مراجعة وتأكيد</option>
                      <option value="unverified">❓ غير متحقق منه</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مصدر الرسوم الرسمي:</label>
                    <input
                      type="text"
                      value={formData.officialSource || ''}
                      onChange={(e) => setFormData({ ...formData, officialSource: e.target.value })}
                      placeholder="مثال: بوابة وزارة التجارة mc.gov.sa"
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط المصدر الحكومي:</label>
                    <input
                      type="url"
                      value={formData.officialSourceUrl || ''}
                      onChange={(e) => setFormData({ ...formData, officialSourceUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1322] p-2 text-slate-800 dark:text-white outline-none font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>حفظ الخدمة</span>
                  </button>
                </div>
              </form>
            )}

            {/* Services Table List */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-[#18233a] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-3">الخدمة والجهة</th>
                    <th className="py-3 px-3">القسم</th>
                    <th className="py-3 px-3 text-left font-mono">الرسم الحكومي</th>
                    <th className="py-3 px-3 text-left font-mono">أتعاب المكتب</th>
                    <th className="py-3 px-3 text-center">حالة التوثيق</th>
                    <th className="py-3 px-3">المصدر الرسمي</th>
                    <th className="py-3 px-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-white/5 font-sans">
                  {filteredServices.map((serv) => (
                    <tr key={serv.id} className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition ${!serv.isActive ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{serv.name}</div>
                        <div className="text-[10px] text-slate-400">{serv.entity}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold">
                          {serv.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-800 dark:text-slate-200">
                        {serv.governmentFee.toLocaleString()} ريال
                      </td>

                      <td className="py-3 px-3 text-left font-mono font-bold text-amber-600 dark:text-amber-400">
                        {serv.defaultOfficeFee.toLocaleString()} ريال
                      </td>

                      <td className="py-3 px-3 text-center">
                        {serv.verificationStatus === 'verified' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3 w-3" />
                            <span>موثق رسمي</span>
                          </span>
                        )}
                        {serv.verificationStatus === 'needs_review' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="h-3 w-3" />
                            <span>مراجعة</span>
                          </span>
                        )}
                        {serv.verificationStatus === 'unverified' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <HelpCircle className="h-3 w-3" />
                            <span>غير مؤكد</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>{serv.officialSource}</span>
                          {serv.officialSourceUrl && (
                            <a
                              href={serv.officialSourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-500 hover:text-amber-600"
                              title="زيارة المصدر الرسمي"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">تحقق: {serv.lastVerifiedAt}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryService(serv)}
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                            title="عرض سجل تغييرات الأسعار"
                          >
                            <History className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(serv)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
                            title="تعديل الخدمة والرسوم"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteService(serv.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="حذف الخدمة"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#152033] border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>إجمالي الخدمات في الدليل: <strong>{services.length} خدمة</strong></span>
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
