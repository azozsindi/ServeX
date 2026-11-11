import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Shield, 
  Building, 
  Briefcase, 
  Phone, 
  Copy, 
  Check, 
  Search, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Share2, 
  X, 
  Lock, 
  User,
  ShieldCheck,
  Database,
  Download,
  Info
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserManagementProps {
  accounts: UserAccount[];
  onAddAccount: (account: UserAccount) => void;
  onUpdateAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onSwitchToWorkspace?: (account: UserAccount) => void;
  currentActiveWorkspaceId?: string;
  isLoggedIn: boolean;
  totalTasksCount?: number;
  totalNotesCount?: number;
  totalPlatformsCount?: number;
  onArchiveCompletedTasks?: (daysOld?: number) => { archivedCount: number };
  onExportAllData?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  totalTasksCount = 0,
  totalNotesCount = 0,
  totalPlatformsCount = 0,
  onArchiveCompletedTasks,
  onExportAllData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Simple Form state: Name, Username, Password, Phone, Status
  const [formData, setFormData] = useState<{
    displayName: string;
    username: string;
    password: string;
    phone: string;
    status: 'active' | 'suspended';
    notes: string;
  }>({
    displayName: '',
    username: '',
    password: '',
    phone: '',
    status: 'active',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormError(null);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      displayName: '',
      username: `emp_${randomSuffix}`,
      password: `Pass@${Math.floor(100000 + Math.random() * 900000)}`,
      phone: '',
      status: 'active',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setFormError(null);
    setFormData({
      displayName: acc.displayName,
      username: acc.username,
      password: acc.password,
      phone: acc.phone || '',
      status: acc.status,
      notes: acc.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let newPass = '';
    for (let i = 0; i < 8; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: newPass }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanName = formData.displayName.trim();
    const cleanUser = formData.username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanPass = formData.password.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      setFormError('يرجى كتابة اسم الموظف، واسم المستخدم، وكلمة المرور');
      return;
    }

    if (editingAccount) {
      // Check collision with another user
      const conflict = accounts.some(a => a.id !== editingAccount.id && a.username.toLowerCase() === cleanUser);
      if (cleanUser === 'azos' || conflict) {
        setFormError('اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر');
        return;
      }

      const updated: UserAccount = {
        ...editingAccount,
        displayName: cleanName,
        username: cleanUser,
        password: cleanPass,
        phone: formData.phone.trim(),
        status: formData.status,
        notes: formData.notes.trim()
      };
      onUpdateAccount(updated);
      setActionNotice(`تم تحديث حساب الموظف (${cleanName}) بنجاح`);
    } else {
      // Check username collision
      if (cleanUser === 'azos' || accounts.some(a => a.username.toLowerCase() === cleanUser)) {
        setFormError('اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر');
        return;
      }

      const newAcc: UserAccount = {
        id: `usr-${Date.now()}`,
        displayName: cleanName,
        username: cleanUser,
        password: cleanPass,
        role: 'employee',
        workspaceName: `مساحة ${cleanName}`,
        workspaceId: `ws-${Date.now()}`,
        phone: formData.phone.trim(),
        status: formData.status,
        createdAt: new Date().toLocaleDateString('ar-SA'),
        notes: formData.notes.trim(),
        storagePolicy: 'local_only', // Zero bytes on Firebase
        permissions: {
          canUseCalculator: true,
          canManageTasks: true,
          canUseAI: true,
          canViewPlatforms: true,
          canEditPlatforms: false,
          canUseScratchpad: true,
          canAccessSettings: false,
        }
      };
      onAddAccount(newAcc);
      setActionNotice(`تم إنشاء حساب الموظف (${cleanName}) بنجاح`);
    }

    setTimeout(() => setActionNotice(null), 4000);
    setIsModalOpen(false);
  };

  const handleCopyCredentials = (acc: UserAccount) => {
    const text = `السلام عليكم ورحمة الله وبركاته،
أهلاً بك زميلنا / ${acc.displayName}،

إليك بيانات دخولك لنظام مكتب الخدمات العامة:
👤 اسم المستخدم: ${acc.username}
🔑 كلمة المرور: ${acc.password}

رابط الدخول: ${window.location.origin}
بالتوفيق في إنجاز المعاملات 💐`;

    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatus = (acc: UserAccount) => {
    const updated: UserAccount = {
      ...acc,
      status: acc.status === 'active' ? 'suspended' : 'active'
    };
    onUpdateAccount(updated);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.phone && acc.phone.includes(searchTerm));
    return matchesSearch;
  });

  const activeCount = accounts.filter(a => a.status === 'active').length;
  const suspendedCount = accounts.filter(a => a.status === 'suspended').length;

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      {/* Top Banner and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Users className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">إدارة حسابات الموظفين</h2>
              <p className="text-xs md:text-sm text-indigo-200">
                أنشئ حسابات للموظفين باسم مستخدم وكلمة مرور فقط، ليدخل كل موظف للوحة التحكم وينجز معاملات المكتب.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>إضافة موظف جديد +</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">إجمالي الموظفين</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{accounts.length}</span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">الموظفون النشطون</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">الحسابات المعلقة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{suspendedCount}</span>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">حماية فايربيس</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">آمنة 100% 🛡️</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">تخزين محلي معزول بدون تكاليف</span>
        </div>
      </div>

      {/* Quick Tools & Search Bar */}
      <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الموظف، اسم المستخدم، أو رقم الجوال..."
            className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          {onExportAllData && (
            <button
              onClick={onExportAllData}
              className="text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#141f33] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="تنزيل نسخة احتياطية محلية لجميع البيانات"
            >
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>نسخة احتياطية (JSON)</span>
            </button>
          )}

          {onArchiveCompletedTasks && (
            <button
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="text-xs font-bold px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="تنظيف المعاملات المنتهية القديمة للحفاظ على خفة وسرعة النظام"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>تنظيف المعاملات القديمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Employee Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#0c1424] rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-3 p-6">
          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">لا يوجد موظفون مطابقون</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            اضغط على زر "إضافة موظف جديد" لكتابة اسم الموظف واسم المستخدم وكلمة المرور وتفعيل دخوله فوراً.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إضافة أول موظف الآن +
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => {
            return (
              <div 
                key={acc.id}
                className="bg-white dark:bg-[#0c1424] rounded-2xl p-5 border border-slate-200/60 dark:border-white/5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between space-y-4"
              >
                {/* Employee Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                          {acc.displayName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          تاريخ الإنشاء: {acc.createdAt || 'مفعل'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      acc.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                    }`}>
                      {acc.status === 'active' ? 'نشط ومفعل' : 'معلق'}
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-[#141f33] rounded-xl border border-slate-150 dark:border-white/5 text-xs">
                    {/* Username */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-500" />
                        اسم المستخدم:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-800 dark:text-white text-xs" dir="ltr">
                          {acc.username}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(acc.username);
                            setActionNotice(`تم نسخ اسم المستخدم (${acc.username})`);
                            setTimeout(() => setActionNotice(null), 2500);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="نسخ اسم المستخدم"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                      <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-500" />
                        كلمة المرور:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-white text-xs" dir="ltr">
                          {showPasswordMap[acc.id] ? acc.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleShowPassword(acc.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title={showPasswordMap[acc.id] ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showPasswordMap[acc.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(acc.password);
                            setActionNotice(`تم نسخ كلمة المرور`);
                            setTimeout(() => setActionNotice(null), 2500);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="نسخ كلمة المرور"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Phone */}
                    {acc.phone && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-emerald-500" />
                          الجوال:
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 text-xs" dir="ltr">
                          {acc.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-150 dark:border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyCredentials(acc)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      copiedId === acc.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300'
                    }`}
                    title="نسخ رسالة جاهزة لإرسالها للموظف بالواتساب"
                  >
                    {copiedId === acc.id ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    <span>{copiedId === acc.id ? 'تم النسخ!' : 'إرسال واتساب'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(acc)}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        acc.status === 'active'
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      }`}
                      title={acc.status === 'active' ? "الحساب نشط (اضغط للتعليق)" : "الحساب معلق (اضغط للتنشيط)"}
                    >
                      {acc.status === 'active' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="تعديل بيانات الموظف"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="حذف الحساب نهائياً"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Employee (Simple & Direct) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c1424] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-150 dark:border-white/10 bg-slate-50/70 dark:bg-[#131b2c]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  {editingAccount ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingAccount ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل الاسم واسم المستخدم وكلمة المرور فقط.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Simple Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Employee Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم الموظف الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="مثال: سعد العتيبي / أحمد الغامدي"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم المستخدم (اليوزر للدخول) *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="مثال: saad_muaqeb"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">كلمة المرور *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    توليد كلمة مرور عشوائية
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="كلمة المرور"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              {/* Mobile Phone (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رقم الجوال (اختياري / للواتساب)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="05XXXXXXXX"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none"
                  dir="ltr"
                />
              </div>

              {/* Account Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حالة الحساب</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'suspended' }))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none"
                >
                  <option value="active">نشط ومفعل (يستطيع الدخول فوراً)</option>
                  <option value="suspended">معلق مؤقتاً (منع الدخول)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-150 dark:border-white/10 flex items-center justify-between">
                {editingAccount ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = editingAccount;
                      setIsModalOpen(false);
                      setAccountToDelete(target);
                    }}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف هذا الحساب</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
                  >
                    {editingAccount ? 'حفظ التعديلات' : 'إنشاء وتفعيل الحساب'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Account (In-App Modal, No window.confirm) */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c1424] rounded-2xl shadow-2xl border border-rose-500/30 dark:border-rose-500/20 overflow-hidden flex flex-col p-6 space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  تأكيد حذف حساب الموظف نهائياً
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إجراء أمني فوري لا يمكن التراجع عنه
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2.5 text-xs">
              <p className="font-bold text-rose-800 dark:text-rose-300">
                هل أنت متأكد من رغبتك في حذف حساب الموظف التالي؟
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-[#141f33] p-3 rounded-xl border border-rose-200/60 dark:border-rose-800/30 shadow-2xs">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-500" />
                  <span className="font-black text-slate-900 dark:text-white text-xs">
                    {accountToDelete.displayName}
                  </span>
                </div>
                <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md" dir="ltr">
                  @{accountToDelete.username}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                ⚠️ سيتم إزالة حسابه وبيانات دخوله فوراً ولن يتمكن من الدخول إلى لوحة التحكم بعد ذلك.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-150 dark:border-white/5">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = accountToDelete.id;
                  const targetName = accountToDelete.displayName;
                  onDeleteAccount(targetId);
                  setAccountToDelete(null);
                  setActionNotice(`تم حذف حساب الموظف (${targetName}) نهائياً بنجاح 🗑️`);
                  setTimeout(() => setActionNotice(null), 4000);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>نعم، حذف الحساب نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Archive Completed Tasks */}
      {isArchiveConfirmOpen && onArchiveCompletedTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c1424] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col p-6 space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  تنظيف وأرشفة المعاملات المنتهية
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  توفير مساحة التخزين وزيادة سرعة النظام
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              سيتم تنزيل نسخة احتياطية محلية تلقائياً بصيغة JSON، ثم أرشفة وحذف المعاملات المنتهية أو الملغاة التي مر عليها أكثر من 30 يوماً من اللوحة والسحابة.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-150 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsArchiveConfirmOpen(false);
                  const res = onArchiveCompletedTasks(30);
                  setActionNotice(`تم تنظيف وأرشفة ${res.archivedCount} معاملة منتهية بنجاح وتنزيل النسخة الاحتياطية`);
                  setTimeout(() => setActionNotice(null), 5000);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>تأكيد الأرشفة والتنظيف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

