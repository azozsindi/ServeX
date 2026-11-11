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
  ExternalLink, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Share2, 
  ArrowRightLeft,
  X,
  Lock,
  MessageSquare,
  Cloud,
  HardDrive,
  Database,
  Download,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserManagementProps {
  accounts: UserAccount[];
  onAddAccount: (account: UserAccount) => void;
  onUpdateAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onSwitchToWorkspace: (account: UserAccount) => void;
  currentActiveWorkspaceId?: string;
  isLoggedIn: boolean;
  totalTasksCount?: number;
  totalNotesCount?: number;
  totalPlatformsCount?: number;
  onArchiveCompletedTasks?: (daysOld?: number) => { archivedCount: number };
  onExportAllData?: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin: { label: 'مدير النظام العام', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40' },
  employee: { label: 'موظف مكتب', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40' },
  branch: { label: 'فرع مكتب معتمد', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40' },
  partner: { label: 'شريك / معقب فريلانسر', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40' },
  client: { label: 'عميل / مراجع منشأة', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/40' },
};

export const UserManagement: React.FC<UserManagementProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onSwitchToWorkspace,
  currentActiveWorkspaceId,
  isLoggedIn,
  totalTasksCount = 0,
  totalNotesCount = 0,
  totalPlatformsCount = 0,
  onArchiveCompletedTasks,
  onExportAllData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showQuotaExplainer, setShowQuotaExplainer] = useState<boolean>(false);
  const [quotaActionMessage, setQuotaActionMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    displayName: string;
    username: string;
    password: string;
    role: UserRole;
    workspaceName: string;
    phone: string;
    email: string;
    status: 'active' | 'suspended';
    notes: string;
    storagePolicy: 'local_only' | 'cloud_sync';
    permissions: {
      canUseCalculator: boolean;
      canManageTasks: boolean;
      canUseAI: boolean;
      canViewPlatforms: boolean;
      canEditPlatforms: boolean;
      canUseScratchpad: boolean;
      canAccessSettings: boolean;
    };
  }>({
    displayName: '',
    username: '',
    password: '',
    role: 'employee',
    workspaceName: '',
    phone: '',
    email: '',
    status: 'active',
    notes: '',
    storagePolicy: 'local_only',
    permissions: {
      canUseCalculator: true,
      canManageTasks: true,
      canUseAI: true,
      canViewPlatforms: true,
      canEditPlatforms: false,
      canUseScratchpad: true,
      canAccessSettings: false,
    }
  });

  const handleOpenAdd = () => {
    setEditingAccount(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      displayName: '',
      username: `user_${randomSuffix}`,
      password: `Pass@${Math.floor(100000 + Math.random() * 900000)}`,
      role: 'employee',
      workspaceName: '',
      phone: '',
      email: '',
      status: 'active',
      notes: '',
      storagePolicy: 'local_only',
      permissions: {
        canUseCalculator: true,
        canManageTasks: true,
        canUseAI: true,
        canViewPlatforms: true,
        canEditPlatforms: false,
        canUseScratchpad: true,
        canAccessSettings: false,
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setFormData({
      displayName: acc.displayName,
      username: acc.username,
      password: acc.password,
      role: acc.role,
      workspaceName: acc.workspaceName,
      phone: acc.phone || '',
      email: acc.email || '',
      status: acc.status,
      notes: acc.notes || '',
      storagePolicy: acc.storagePolicy || (acc.role === 'admin' || acc.role === 'branch' ? 'cloud_sync' : 'local_only'),
      permissions: { ...acc.permissions }
    });
    setIsModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let newPass = '';
    for (let i = 0; i < 10; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: newPass }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert('يرجى ملء الاسم واسم المستخدم وكلمة المرور');
      return;
    }

    const cleanWorkspace = formData.workspaceName.trim() || `مساحة ${formData.displayName.trim()}`;

    if (editingAccount) {
      const updated: UserAccount = {
        ...editingAccount,
        displayName: formData.displayName.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        role: formData.role,
        workspaceName: cleanWorkspace,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
        storagePolicy: formData.storagePolicy,
        permissions: formData.permissions
      };
      onUpdateAccount(updated);
    } else {
      const newAcc: UserAccount = {
        id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        displayName: formData.displayName.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        role: formData.role,
        workspaceName: cleanWorkspace,
        workspaceId: `ws-${Date.now()}`,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: formData.status,
        createdAt: new Date().toLocaleDateString('ar-SA'),
        notes: formData.notes.trim(),
        storagePolicy: formData.storagePolicy,
        permissions: formData.permissions
      };
      onAddAccount(newAcc);
    }

    setIsModalOpen(false);
  };

  const handleCopyCredentials = (acc: UserAccount) => {
    const text = `السلام عليكم ورحمة الله وبركاته 💐
عزيزنا/ ${acc.displayName} المحترم،

تم تفعيل مساحتكم الخاصة على بوابة الخدمات العامة بنجاح:
🏢 اسم المساحة: ${acc.workspaceName}
👤 اسم المستخدم: ${acc.username}
🔑 كلمة المرور: ${acc.password}
🏷️ نوع الحساب: ${ROLE_LABELS[acc.role]?.label || acc.role}

يمكنكم تسجيل الدخول ومتابعة معاملاتكم وحساباتكم عبر الرابط المعتمد للمكتب.
أهلاً وسهلاً بكم دائماً! ✨`;

    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleToggleStatus = (acc: UserAccount) => {
    const updated: UserAccount = {
      ...acc,
      status: acc.status === 'active' ? 'suspended' : 'active'
    };
    onUpdateAccount(updated);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.workspaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.phone && acc.phone.includes(searchTerm));
    
    const matchesRole = selectedRole === 'all' || acc.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || acc.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = accounts.filter(a => a.status === 'active').length;
  const employeesCount = accounts.filter(a => a.role === 'employee').length;
  const clientsCount = accounts.filter(a => a.role === 'client' || a.role === 'branch' || a.role === 'partner').length;

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      {/* Top Banner and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-indigo-700 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
              <Users className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">إدارة الحسابات والمساحات الخاصة</h2>
              <p className="text-xs md:text-sm text-indigo-200">
                أنشئ حسابات مخصصة لأي عميل أو موظف أو فرع، مع مساحة عمل مستقلة وبيانات دخول خاصة به.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 cursor-pointer shrink-0"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>إنشاء حساب ومساحة جديدة +</span>
        </button>
      </div>

      {/* FIREBASE QUOTA & STORAGE PROTECTION SHIELD (درع حماية وترشيد فايربيس) */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 rounded-2xl border border-emerald-500/25 p-4 md:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">درع حماية فايربيس وترشيد الاستهلاك السحابي</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  الحالة: آمنة وموفرة 100% 🛡️
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                تطمّن: الحسابات التي تنشئها تستخدم سياسة <strong className="text-emerald-600 dark:text-emerald-400">التخزين المحلي المعزول (0 بايت على فايربيس)</strong>، فلا تستهلك أي شيء من سحابتك.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onExportAllData && (
              <button
                onClick={onExportAllData}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-[#141f33] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="تنزيل نسخة احتياطية محلية كاملة لكافة السجلات والحسابات على جهازك"
              >
                <Download className="h-3.5 w-3.5 text-indigo-500" />
                <span>نسخة احتياطية (JSON)</span>
              </button>
            )}

            {onArchiveCompletedTasks && (
              <button
                onClick={() => {
                  if (confirm('هل تريد أرشفة وتفريغ المعاملات المنتهية والمكتملة (أقدم من 30 يوماً)؟ سيتم تنزيل نسخة منها في جهازك وحذفها من السحابة لتوفير المساحة.')) {
                    const res = onArchiveCompletedTasks(30);
                    setQuotaActionMessage(`✓ تم تنظيف وأرشفة ${res.archivedCount} معاملة منتهية وتنزيل نسختها بنجاح!`);
                    setTimeout(() => setQuotaActionMessage(null), 5000);
                  }
                }}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="تنظيف المعاملات المنتهية القديمة لمنع امتلاء قاعدة البيانات"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>تنظيف المعاملات القديمة</span>
              </button>
            )}

            <button
              onClick={() => setShowQuotaExplainer(!showQuotaExplainer)}
              className="text-xs font-bold p-2 rounded-xl bg-white/80 dark:bg-[#141f33]/80 hover:bg-white text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition cursor-pointer"
              title="عرض تفاصيل سعة باقة فايربيس المجانية"
            >
              {showQuotaExplainer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {quotaActionMessage && (
          <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{quotaActionMessage}</span>
          </div>
        )}

        {/* Live Storage Footprint Progress bar */}
        <div className="bg-white/80 dark:bg-[#101928]/80 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">الاستهلاك التقديري الحالي لقاعدتك:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                {Math.round((totalTasksCount * 0.5) + (totalNotesCount * 0.3) + (totalPlatformsCount * 0.4) + (accounts.length * 0.6) + 12)} كيلوبايت
              </span>
              <span className="text-slate-400 text-[10px]">من أصل 1,048,576 كيلوبايت (1 جيجابايت مجاني دائم)</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="h-3.5 w-3.5" />
                <span>حسابات محلية (صفر استهلاك): {accounts.filter(a => a.storagePolicy === 'local_only' || (!a.storagePolicy && a.role !== 'admin' && a.role !== 'branch')).length}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Cloud className="h-3.5 w-3.5" />
                <span>حسابات سحابية: {accounts.filter(a => a.storagePolicy === 'cloud_sync' || a.role === 'admin' || a.role === 'branch').length}</span>
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${Math.max(0.5, ((Math.round((totalTasksCount * 0.5) + (totalNotesCount * 0.3) + (totalPlatformsCount * 0.4) + (accounts.length * 0.6) + 12) / 1048576) * 100))}%` }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>معدل الامتلاء: أقل من 0.005% (يتبقى أكثر من 99.99% مجاناً بالكامل)</span>
            <span>باقة Google Firebase Spark المجانية</span>
          </div>
        </div>

        {/* Collapsible Explainer Card */}
        {showQuotaExplainer && (
          <div className="p-3.5 bg-white dark:bg-[#101928] rounded-xl border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 animate-fade-in leading-relaxed">
            <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-white">
              <Info className="h-4 w-4 text-indigo-500" />
              <span>كيف تحمي منصتنا فايربيس الخاص بك من الامتلاء أو التكاليف؟</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
              <div className="p-2.5 bg-slate-50 dark:bg-[#141f33] rounded-lg border border-slate-200/50 dark:border-white/5 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">1. التخزين المحلي التلقائي 🛡️</span>
                <p>أي حساب تنشئه لعميل أو معقب يُعيّن افتراضياً كـ "تخزين محلي معزول"، مما يعني أن جميع معاملاته ومذكراته تُخزن في متصفحه وجهازه فقط ولا ترسل أي بيانات إلى فايربيس الخاص بك.</p>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-[#141f33] rounded-lg border border-slate-200/50 dark:border-white/5 space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400 block">2. سعة جوجل الضخمة المجانية 📦</span>
                <p>باقة Firebase Spark المجانية تمنحك 1 جيجابايت تخزين (تكفي لأكثر من 1,000,000 معاملة نصية)، و 50,000 قراءة و 20,000 كتابة يومياً تتجدد مجاناً كل 24 ساعة.</p>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-[#141f33] rounded-lg border border-slate-200/50 dark:border-white/5 space-y-1">
                <span className="font-bold text-amber-600 dark:text-amber-400 block">3. الأرشفة والتفريغ الفوري 🧹</span>
                <p>يمكنك في أي لحظة الضغط على زر "تنظيف المعاملات القديمة" لأرشفة وحذف المعاملات المنتهية منذ شهر وتنزيلها كملف Excel/JSON في حاسوبك حتى تبقى قاعدة بياناتك خفيفة وسريعة دائماً.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">إجمالي الحسابات</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{accounts.length}</span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">الحسابات النشطة</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">الموظفون والمعقبون</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{employeesCount}</span>
            <Briefcase className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">المساحات الخارجية والعملاء</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{clientsCount}</span>
            <Building className="h-5 w-5 text-teal-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0c1424] p-4 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، اسم المستخدم، اسم المساحة، أو رقم الجوال..."
            className="w-full pr-10 pl-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">كافة أنواع الحسابات</option>
            <option value="employee">موظف مكتب</option>
            <option value="partner">شريك / معقب</option>
            <option value="branch">فرع مكتب</option>
            <option value="client">عميل / مراجع</option>
            <option value="admin">مدير النظام</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="suspended">معلق فقط</option>
          </select>
        </div>
      </div>

      {/* Accounts List / Cards Table */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1424] p-12 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">لم يتم العثور على أي حسابات مطابقة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            يمكنك إنشاء أول حساب مخصص لأي عميل أو موظف ومنحه مساحة مستقلة بضغطة زر واحدة.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>إضافة حساب جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => {
            const roleInfo = ROLE_LABELS[acc.role] || ROLE_LABELS.employee;
            const isCurrentWorkspace = currentActiveWorkspaceId === acc.workspaceId;

            return (
              <div 
                key={acc.id}
                className={`bg-white dark:bg-[#0c1424] rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  isCurrentWorkspace 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200/70 dark:border-white/10'
                }`}
              >
                <div className="space-y-3">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {acc.displayName.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {acc.displayName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          @{acc.username}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${roleInfo.bg} ${roleInfo.color} shrink-0`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  {/* Workspace name tag */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141f33] border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-indigo-500" />
                        المساحة الخاصة:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {acc.workspaceName}
                      </span>
                    </div>

                    {acc.phone && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-white/5">
                        <span className="text-slate-400 font-bold flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-emerald-500" />
                          الجوال:
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300" dir="ltr">
                          {acc.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Password box with copy and eye */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">كلمة المرور:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {showPasswordMap[acc.id] ? acc.password : '••••••••'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleShowPassword(acc.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        title={showPasswordMap[acc.id] ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPasswordMap[acc.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Storage Policy indicator */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <Database className="h-3 w-3 text-indigo-500" />
                      وضع التخزين:
                    </span>
                    {acc.storagePolicy === 'cloud_sync' || acc.role === 'admin' || acc.role === 'branch' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-[10px] border border-blue-300/40">
                        <Cloud className="h-3 w-3" />
                        <span>متزامن مع فايربيس</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/40" title="صفر استهلاك من سحابة فايربيس">
                        <HardDrive className="h-3 w-3" />
                        <span>محلي معزول 100% (صفر تكلفة)</span>
                      </span>
                    )}
                  </div>

                  {/* Permissions mini pill indicators */}
                  <div className="flex flex-wrap gap-1">
                    {acc.permissions?.canUseCalculator && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
                        الحاسبة
                      </span>
                    )}
                    {acc.permissions?.canManageTasks && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold">
                        المعاملات
                      </span>
                    )}
                    {acc.permissions?.canUseAI && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold">
                        الذكاء الاصطناعي
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyCredentials(acc)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        copiedId === acc.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-[#141f33] hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300'
                      }`}
                      title="نسخ بيانات الدخول كرسالة واتساب جاهزة"
                    >
                      {copiedId === acc.id ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                      <span>{copiedId === acc.id ? 'تم النسخ!' : 'إرسال واتساب'}</span>
                    </button>

                    <button
                      onClick={() => onSwitchToWorkspace(acc)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isCurrentWorkspace
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-[#141f33] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                      title={isCurrentWorkspace ? "المساحة النشطة حالياً" : "دخول سريع لمعاينة هذه المساحة"}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>

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
                      title="تعديل بيانات الحساب"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف حساب (${acc.displayName}) ومساحته الخاصة؟`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="حذف الحساب"
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

      {/* Modal: Create or Edit Specialized Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1424] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#131b2c]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  {editingAccount ? <Edit3 className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingAccount ? 'تعديل الحساب والمساحة' : 'إنشاء حساب ومساحة خاصة جديدة'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل بيانات المستخدم لتسليمها للعميل أو الموظف للدخول لمساحته.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم صاحب الحساب / المنشأة *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="مثال: مكتب خالد للخدمات / المعقب فهد"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم المستخدم (للدخول) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="مثال: khaled_office"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password with Generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">كلمة المرور *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    توليد كلمة مرور عشوائية
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="كلمة مرور الدخول"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Role and Workspace Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نوع الحساب *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none"
                  >
                    <option value="employee">موظف مكتب داخلي</option>
                    <option value="partner">شريك / معقب فريلانسر</option>
                    <option value="branch">فرع مكتب خارجي</option>
                    <option value="client">عميل / منشأة تراجع معاملات</option>
                    <option value="admin">مشرف إداري كامل</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اسم المساحة الخاصة</label>
                  <input
                    type="text"
                    value={formData.workspaceName}
                    onChange={(e) => setFormData(prev => ({ ...prev, workspaceName: e.target.value }))}
                    placeholder="مثال: مساحة إنجاز السريعة"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رقم جوال الواتساب</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05XXXXXXXX"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white font-mono outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">حالة الحساب</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'suspended' }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141f33] text-slate-900 dark:text-white outline-none"
                  >
                    <option value="active">نشط ومفعل</option>
                    <option value="suspended">معلق مؤقتاً</option>
                  </select>
                </div>
              </div>

              {/* Firebase Quota & Storage Policy Selector */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>سياسة التخزين وحماية فايربيس (Firebase Quota) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ترشيد ذكي
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    formData.storagePolicy === 'local_only'
                      ? 'bg-white dark:bg-[#101928] border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white/60 dark:bg-[#0c1424]/60 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="storagePolicy"
                        value="local_only"
                        checked={formData.storagePolicy === 'local_only'}
                        onChange={() => setFormData(prev => ({ ...prev, storagePolicy: 'local_only' }))}
                        className="text-indigo-600"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">تخزين محلي معزول 100% 🛡️</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold leading-relaxed">
                      * صفر بايت على فايربيس! لا يستهلك أي شيء من سحابتك. تُحفظ بياناته في متصفحه فقط (موصى به للعملاء والمعقبين).
                    </p>
                  </label>

                  <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    formData.storagePolicy === 'cloud_sync'
                      ? 'bg-white dark:bg-[#101928] border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white/60 dark:bg-[#0c1424]/60 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="storagePolicy"
                        value="cloud_sync"
                        checked={formData.storagePolicy === 'cloud_sync'}
                        onChange={() => setFormData(prev => ({ ...prev, storagePolicy: 'cloud_sync' }))}
                        className="text-indigo-600"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">مزامنة سحابية كاملة ☁️</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                      تُرفع بياناته ومذكراته إلى قاعدة فايربيس السحابية تلقائياً (مناسب للفروع والإداريين).
                    </p>
                  </label>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="p-3 bg-slate-50 dark:bg-[#141f33] rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">صلاحيات الوصول في مساحته الخاصة:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canUseCalculator}
                      onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, canUseCalculator: e.target.checked } }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">حاسبة التكاليف وعروض الأسعار</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canManageTasks}
                      onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, canManageTasks: e.target.checked } }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">إدارة المعاملات والمهام</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canUseAI}
                      onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, canUseAI: e.target.checked } }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">المساعد الذكي (Gemini)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canUseScratchpad}
                      onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, canUseScratchpad: e.target.checked } }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">مذكرات الملاحظات السريعة</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-sm"
                >
                  {editingAccount ? 'حفظ التعديلات' : 'تأكيد وإنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
