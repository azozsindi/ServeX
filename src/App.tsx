import React, { useState, useEffect } from 'react';
import { Platform, Task, QuickNote, SavedTemplate } from './types';
import { INITIAL_PLATFORMS, INITIAL_TEMPLATES } from './data/initialData';

// Firebase core configuration & sync functions
import {
  auth,
  googleProvider,
  hasValidConfig,
  finalConfig,
  uploadPlatformToCloud,
  deletePlatformFromCloud,
  uploadTaskToCloud,
  deleteTaskFromCloud,
  uploadQuickNoteToCloud,
  deleteQuickNoteFromCloud,
  uploadTemplateToCloud,
  deleteTemplateFromCloud,
  uploadSettingsToCloud,
  fetchPlatformsFromCloud,
  fetchTasksFromCloud,
  fetchQuickNotesFromCloud,
  fetchTemplatesFromCloud,
  fetchSettingsFromCloud,
  syncAllLocalToCloud
} from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Custom components
import PlatformCard from './components/PlatformCard';
import FeeCalculator from './components/FeeCalculator';
import QuickNotes from './components/QuickNotes';
import ReadyTemplates from './components/ReadyTemplates';
import TaskTracker from './components/TaskTracker';
import PlatformManagerModal from './components/PlatformManagerModal';

// New Modular Pages
import SmartAssistant from './components/SmartAssistant';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';

// Icons
import { 
  Building2, 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Clock, 
  HelpCircle, 
  Grid, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  Compass, 
  Smartphone, 
  Workflow, 
  Layers,
  Calculator,
  MessageSquare,
  NotebookPen,
  ClipboardCheck,
  Sparkles,
  Bookmark,
  Settings,
  Calendar as CalendarIcon,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  FolderOpen,
  LogOut,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  // --- Cloud Sync configuration states ---
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem('s_cloud_sync_enabled') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync isCloudSyncEnabled state to local storage
  useEffect(() => {
    localStorage.setItem('s_cloud_sync_enabled', String(isCloudSyncEnabled));
  }, [isCloudSyncEnabled]);

  // Handle Firebase Auth changes
  useEffect(() => {
    if (hasValidConfig && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        // Automatically fetch settings and configurations when user logs in and cloud sync is enabled
        if (user && isCloudSyncEnabled) {
          fetchSettingsFromCloud().then((settings) => {
            if (settings) {
              setOfficeName(settings.officeName);
              setDefaultCommission(settings.defaultCommission);
            }
          }).catch(err => console.error("Could not fetch cloud settings", err));
        }
      });
      return () => unsubscribe();
    }
  }, [isCloudSyncEnabled]);

  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('s_dashboard_dark');
    return saved ? saved === 'true' : false;
  });

  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('s_azos_logged_in') === 'true';
  });

  // --- Login Credentials input states ---
  const [loginUser, setLoginUser] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginUser.trim();
    if (cleanUser === 'azos' && loginPass === 'Aa@000a000') {
      localStorage.setItem('s_azos_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError('خطأ في اسم المستخدم أو كلمة المرور بالخدمة. يرجى التأكد وإعادة المحاولة.');
    }
  };

  // --- Office Profile Configurations ---
  const [officeName, setOfficeName] = useState<string>(() => {
    const saved = localStorage.getItem('s_dashboard_office_name');
    return saved || 'مكتب الخدمات العامة الموحد';
  });

  const [defaultCommission, setDefaultCommission] = useState<number>(() => {
    const saved = localStorage.getItem('s_dashboard_default_commission');
    return saved ? parseInt(saved) : 100;
  });

  // --- Core Platform, Task, Notes, Templates states ---
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const saved = localStorage.getItem('s_dashboard_platforms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing platforms from localStorage', e);
      }
    }
    return INITIAL_PLATFORMS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('s_dashboard_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing tasks from localStorage', e);
      }
    }
    return [];
  });

  const [templates, setTemplates] = useState<SavedTemplate[]>(() => {
    const saved = localStorage.getItem('s_dashboard_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing templates from localStorage', e);
      }
    }
    return INITIAL_TEMPLATES;
  });

  const [notes, setNotes] = useState<QuickNote[]>(() => {
    const saved = localStorage.getItem('s_dashboard_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notes from localStorage', e);
      }
    }
    // Set some nice default helpful notes for General Services
    return [
      {
        id: 'n-def-1',
        title: '💡 إرشادات خصوصية العملاء',
        content: 'تنبيه هام للموظفين: يمنع منعاً باتاً الاحتفاظ بكلمات مرور نظام "أبشر" أو قوى الخاصة بالعملاء في مذكرات ورقية أو نصية خارجية حمايةً لقواعد الأمان والخصوصية لمكتبنا.',
        color: 'red',
        updatedAt: new Date().toLocaleDateString('ar-SA')
      },
      {
        id: 'n-def-2',
        title: '📞 ساعات تخليص المعاملات',
        content: 'نظام وزارة العدل قوى يستقبل رفع الطلبات المباشرة في كافة الأيام، لكن تدقيق السجلات لدى مكاتب ومندوبي مساند والضمان يستغرق من 24 لـ 48 ساعة كحد أقصى للقبول بموافقة وزارة الموارد البشرية.',
        color: 'blue',
        updatedAt: new Date().toLocaleDateString('ar-SA')
      }
    ];
  });

  // UI Navigation / Sidebar structure
  const [activeTab, setActiveTab] = useState<'home' | 'platforms' | 'tasks' | 'calculator' | 'templates' | 'notes' | 'calendar' | 'assistant' | 'settings'>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Platform list layout options
  const [platformSearch, setPlatformSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const [platformPage, setPlatformPage] = useState<number>(1);
  const platformsPerPage = 12;

  // Dynamic real-time clock state
  const [currentTime, setCurrentTime] = useState<string>('');
  const [arabicDate, setArabicDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const today = new Date();
    setArabicDate(today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    return () => clearInterval(interval);
  }, []);

  // Sync state to local storage when state changes
  useEffect(() => {
    localStorage.setItem('s_dashboard_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('s_dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('s_dashboard_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('s_dashboard_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('s_dashboard_office_name', officeName);
  }, [officeName]);

  useEffect(() => {
    localStorage.setItem('s_dashboard_default_commission', String(defaultCommission));
  }, [defaultCommission]);

  // Apply or remove Dark mode class on body element
  useEffect(() => {
    localStorage.setItem('s_dashboard_dark', String(darkMode));
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reset page to 1 on searching or filtering platforms
  useEffect(() => {
    setPlatformPage(1);
  }, [platformSearch, selectedCategory]);

  // --- Handlers for custom platforms ---
  const handleAddPlatform = (newPlatform: Omit<Platform, 'order'>) => {
    const nextOrder = platforms.length > 0 ? Math.max(...platforms.map(p => p.order)) + 1 : 1;
    const added: Platform = {
      ...newPlatform,
      order: nextOrder
    };
    setPlatforms([...platforms, added]);
    if (isCloudSyncEnabled && currentUser) {
      uploadPlatformToCloud(added).catch(err => console.error("Cloud platforms sync error:", err));
    }
  };

  const handleDeletePlatform = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه المنصة من لوحة التحكم؟ يمكنك إضافتها لاحقاً إذا أردت.')) {
      setPlatforms(platforms.filter(p => p.id !== id));
      if (isCloudSyncEnabled && currentUser) {
        deletePlatformFromCloud(id).catch(err => console.error("Cloud platforms delete error:", err));
      }
    }
  };

  const handleMovePlatformForward = (index: number) => {
    if (index === platforms.length - 1) return;
    const updated = [...platforms];
    const tempOrder = updated[index].order;
    updated[index].order = updated[index + 1].order;
    updated[index + 1].order = tempOrder;
    updated.sort((a, b) => a.order - b.order);
    setPlatforms(updated);
    if (isCloudSyncEnabled && currentUser) {
      uploadPlatformToCloud(updated[index]).catch(err => console.error(err));
      uploadPlatformToCloud(updated[index + 1]).catch(err => console.error(err));
    }
  };

  const handleMovePlatformBackward = (index: number) => {
    if (index === 0) return;
    const updated = [...platforms];
    const tempOrder = updated[index].order;
    updated[index].order = updated[index - 1].order;
    updated[index - 1].order = tempOrder;
    updated.sort((a, b) => a.order - b.order);
    setPlatforms(updated);
    if (isCloudSyncEnabled && currentUser) {
      uploadPlatformToCloud(updated[index]).catch(err => console.error(err));
      uploadPlatformToCloud(updated[index - 1]).catch(err => console.error(err));
    }
  };

  const handleSaveTemplates = (updated: SavedTemplate[]) => {
    setTemplates(updated);
    if (isCloudSyncEnabled && currentUser) {
      // Sync any new/updated ones
      for (const item of updated) {
        uploadTemplateToCloud(item).catch(err => console.error(err));
      }
      // Delete any ones that were removed
      const removed = templates.filter(t1 => !updated.some(t2 => t2.id === t1.id));
      for (const r of removed) {
        deleteTemplateFromCloud(r.id).catch(err => console.error(err));
      }
    }
  };

  const handleSaveTasks = (updated: Task[]) => {
    setTasks(updated);
    if (isCloudSyncEnabled && currentUser) {
      // Sync new/updated ones
      for (const item of updated) {
        uploadTaskToCloud(item).catch(err => console.error(err));
      }
      // Delete any ones that were removed
      const removed = tasks.filter(t1 => !updated.some(t2 => t2.id === t1.id));
      for (const r of removed) {
        deleteTaskFromCloud(r.id).catch(err => console.error(err));
      }
    }
  };

  const handleSaveNotes = (updated: QuickNote[]) => {
    setNotes(updated);
    if (isCloudSyncEnabled && currentUser) {
      for (const item of updated) {
        uploadQuickNoteToCloud(item).catch(err => console.error(err));
      }
      const removed = notes.filter(n1 => !updated.some(n2 => n2.id === n1.id));
      for (const r of removed) {
        deleteQuickNoteFromCloud(r.id).catch(err => console.error(err));
      }
    }
  };

  // --- Firebase Cloud Action Trigger Helpers ---
  const handleGoogleSignIn = async () => {
    setSyncStatus("جاري تسجيل الدخول عبر Google...");
    try {
      await signInWithPopup(auth, googleProvider);
      setSyncStatus("✓ تم تسجيل الدخول بنجاح!");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`❌ فشل تسجيل الدخول: ${err.message}`);
    }
  };

  const handleGoogleSignOut = async () => {
    setSyncStatus("جاري تسجيل الخروج وتأمين الجلسة...");
    try {
      await signOut(auth);
      setSyncStatus("✓ تم تسجيل الخروج بنجاح.");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`❌ فشل تسجيل الخروج: ${err.message}`);
    }
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus("جاري تهيئة ورفع البيانات المحلية إلى Firestore...");
    try {
      await syncAllLocalToCloud({
        platforms,
        tasks,
        quickNotes: notes,
        templates,
        officeName,
        defaultCommission
      });
      setSyncStatus("✓ تمت مزامنة ورفع كافة السجلات بنجاح!");
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`❌ فشل الرفع السحابي: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatus("جاري سحب وتحديث البيانات من سحابة Firestore...");
    try {
      const fetchedPlatforms = await fetchPlatformsFromCloud();
      const fetchedTasks = await fetchTasksFromCloud();
      const fetchedNotes = await fetchQuickNotesFromCloud();
      const fetchedTemplates = await fetchTemplatesFromCloud();
      const fetchedSettings = await fetchSettingsFromCloud();

      if (fetchedPlatforms.length > 0) setPlatforms(fetchedPlatforms);
      if (fetchedTasks.length > 0) setTasks(fetchedTasks);
      if (fetchedNotes.length > 0) setNotes(fetchedNotes);
      if (fetchedTemplates.length > 0) setTemplates(fetchedTemplates);
      if (fetchedSettings) {
        setOfficeName(fetchedSettings.officeName);
        setDefaultCommission(fetchedSettings.defaultCommission);
      }

      setSyncStatus("✓ تم سحب وتطبيق التحديثات السحابية بنجاح!");
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      console.error(err);
      setSyncStatus(`❌ فشل تحميل البيانات: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Factory reset everything
  const handleResetAllData = () => {
    localStorage.removeItem('s_dashboard_platforms');
    localStorage.removeItem('s_dashboard_tasks');
    localStorage.removeItem('s_dashboard_templates');
    localStorage.removeItem('s_dashboard_notes');
    localStorage.removeItem('s_assistant_messages');
    localStorage.removeItem('s_dashboard_office_name');
    localStorage.removeItem('s_dashboard_default_commission');
    localStorage.removeItem('s_dashboard_dark');
    localStorage.removeItem('s_cloud_sync_enabled');
    
    setPlatforms(INITIAL_PLATFORMS);
    setTasks([]);
    setTemplates(INITIAL_TEMPLATES);
    setNotes([]);
    setOfficeName('مكتب الخدمات العامة الموحد');
    setDefaultCommission(100);
    setIsCloudSyncEnabled(false);
  };

  // Category list filter
  const categoryFilterTags = [
    { label: 'الكل وقائمتي', value: 'الكل' },
    { label: 'حكومية وأفراد', value: 'government' },
    { label: 'أعمال وتجارة وسجل', value: 'business' },
    { label: 'توظيف وعقود عمل', value: 'employment' },
    { label: 'خدمات قضائية ناجز', value: 'justice' },
    { label: 'مضاف يدوياً مخصص', value: 'custom' },
  ];

  const sortedPlatforms = [...platforms].sort((a, b) => a.order - b.order);

  const filteredPlatforms = sortedPlatforms.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(platformSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(platformSearch.toLowerCase()) ||
                          p.url.toLowerCase().includes(platformSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPlatformPages = Math.ceil(filteredPlatforms.length / platformsPerPage) || 1;
  const paginatedPlatforms = filteredPlatforms.slice(
    (platformPage - 1) * platformsPerPage,
    platformPage * platformsPerPage
  );

  // Navigation Sidebar options list
  const sidebarTabs = [
    { id: 'home', label: 'الرئيسية والمؤشرات', icon: Grid, count: null, color: 'text-indigo-500' },
    { id: 'platforms', label: 'المنصات والروابط', icon: Layers, count: platforms.length, color: 'text-emerald-500' },
    { id: 'tasks', label: 'المعاملات والطلبات', icon: ClipboardCheck, count: tasks.filter(t => t.status !== 'completed').length, color: 'text-amber-500' },
    { id: 'notes', label: 'الملاحظات مذكراتي', icon: NotebookPen, count: notes.length, color: 'text-rose-500' },
    { id: 'templates', label: 'النصوص والرسائل الجاهزة', icon: MessageSquare, count: templates.length, color: 'text-blue-500' },
    { id: 'calendar', label: 'التقويم والتواريخ', icon: CalendarIcon, count: null, color: 'text-purple-500' },
    { id: 'calculator', label: 'حاسبة الرسوم والأتعاب', icon: Calculator, count: null, color: 'text-teal-500' },
    { id: 'assistant', label: 'المساعد الذكي الفوري', icon: Sparkles, count: 'AI', color: 'text-orange-500 shadow-sm' },
    { id: 'settings', label: 'إعدادات المكتب والبيانات', icon: Settings, count: null, color: 'text-slate-400' }
  ];

  // Live filter sidebar tabs if searched
  const filteredSidebarTabs = sidebarTabs.filter(tab => 
    tab.label.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div dir="rtl" className={`min-h-screen bg-[#fafbff] dark:bg-immersive-bg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Decorative background ambient shapes */}
        <div className="absolute top-[-250px] right-[-250px] w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-250px] left-[-250px] w-[500px] h-[500px] bg-[#6366f1]/10 dark:bg-[#6366f1]/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Toggle Dark mode button for accessibility during login */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-650 dark:bg-[#152033] dark:hover:bg-[#1b2a45] dark:text-slate-350 rounded-xl transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer shadow-xs"
            title={darkMode ? 'الوضع المضيء' : 'الوضع الداكن'}
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="w-full max-w-md bg-white dark:bg-[#101928] rounded-3xl border border-slate-200/60 dark:border-white/5 p-6 sm:p-8 shadow-xl relative z-10 transition-all text-right">
          
          {/* Brand header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="p-3.5 bg-gradient-to-tr from-teal-600 to-emerald-505 rounded-2xl text-white shadow-md flex items-center justify-center relative">
              <Building2 className="h-8 w-8 text-white" />
              <ShieldCheck className="h-4 w-4 text-emerald-350 absolute -bottom-1 -left-1 bg-white dark:bg-[#101928] rounded-full p-0.5" />
            </div>
            
            <div>
              <h2 className="text-lg font-black text-slate-805 dark:text-white tracking-tight">{officeName}</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-bold">لوحة تسجيل الدخول والتحصين المعتمدة</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-xl text-xs font-bold leading-relaxed text-right animate-pulse">
                ⚠️ {loginError}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1 text-right">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-350">اسم المستخدم (اليوزر):</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم المستخدم (azos)..."
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-3 pr-10 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-[#152033]/50 transition"
                />
                <User className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1 text-right">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-350">كلمة المرور:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="أدخل كلمة المرور السرية..."
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-[#152033]/50 transition font-sans"
                />
                <Lock className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                
                {/* Reveal password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Credentials Info Tip Box */}
            <div className="p-3 bg-emerald-500/5 dark:bg-[#121b2b] rounded-xl border border-emerald-550/10 text-[11px] text-slate-500 dark:text-slate-350 leading-relaxed font-semibold text-right space-y-1">
              <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <KeyRound className="h-3.5 w-3.5" />
                <span>شفرة المرور التجريبية المتوفرة:</span>
              </div>
              <div className="font-mono text-[10px] mt-1 space-y-0.5 opacity-90">
                <div>اسم المستخدم: <span className="text-slate-805 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-700/50 px-1 py-0.5 rounded">azos</span></div>
                <div>كلمة المرور: <span className="text-slate-805 dark:text-slate-100 bg-slate-200/50 dark:bg-slate-700/50 px-1 py-0.5 rounded">Aa@000a000</span></div>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 transform active:scale-[0.98]"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>تسجيل الدخول الآمن للوحة التحكم</span>
            </button>
          </form>

          {/* Secure metadata badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-bold">
            <span>نظام تخزين محلي مشفر</span>
            <span>لوحة الموظف المؤمّنة 1447هـ</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#fafbff] dark:bg-immersive-bg text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col relative overflow-hidden">
      
      {/* Decorative ambient backdrop shapes */}
      <div className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-[-200px] w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* HEADER BAR - Displays static time & brand info */}
      <header className="bg-white/80 dark:bg-immersive-card/90 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 transition-all sticky top-0 z-40 shrink-0">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl text-white shadow-md flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">{officeName}</h1>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                  لوحة الموظف المؤمّنة
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">مركز قيادة متكامل وموحد لجميع المنصات الحكومية اليومية والعمليات الذكية</p>
            </div>
          </div>

          {/* Time & Theme switcher controls */}
          <div className="flex items-center gap-3">
            
            {/* Realtime Saudi clock display */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-slate-100/70 dark:bg-[#152033] border border-slate-200/50 dark:border-white/5 rounded-xl text-right">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-355">{arabicDate}</span>
              </div>
              <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-450">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-black font-mono">{currentTime || '--:--:--'}</span>
              </div>
            </div>

            {/* Light/Dark mode toggles */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-[#152033] dark:hover:bg-[#1b2a45] dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer"
              title={darkMode ? 'تحويل للمضيء' : 'تحويل لليلي'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* BODY LAYOUT CONTAINER: Separating fixed collapsible LEFT sidebar and content RIGHT */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* SIDEBAR ON THE LEFT SIDE - Fixed visual order on left of layout */}
        <aside 
          id="main-sidebar-left"
          className={`bg-white dark:bg-immersive-card border-r md:border-r-0 md:border-l border-slate-200/60 dark:border-white/5 transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between py-4 select-none z-30 ${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } order-first md:order-last`} // Left position mapping under RTL
        >
          <div className="space-y-4 px-3">
            
            {/* Collapse / Expand toggle trigger button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              {!sidebarCollapsed && <span className="text-xs font-black text-slate-400 block px-1">القائمة والأقسام الرئيسية</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#152033] dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer"
                title={sidebarCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
              >
                {sidebarCollapsed ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick search input within the sidebar */}
            {!sidebarCollapsed && (
              <div className="relative">
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="ابحث سريعا عن قسم..."
                  className="w-full text-[11px] rounded-lg border border-slate-205 bg-slate-50/50 py-2 pl-2 pr-8 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white dark:focus:border-indigo-505 transition"
                />
                <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            )}

            {/* List of sidebar links */}
            <nav className="space-y-1.5 overflow-y-auto max-h-[480px] pr-0.5 custom-scrollbar">
              {filteredSidebarTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center rounded-xl p-2.5 text-xs font-black transition cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/10'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152033]/80'
                    } ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
                    title={tab.label}
                  >
                    <div className="flex items-center gap-2.5">
                      <TabIcon className={`h-4.5 w-4.5 transition ${isActive ? 'text-white' : tab.color} group-hover:scale-105`} />
                      {!sidebarCollapsed && <span className="whitespace-nowrap">{tab.label}</span>}
                    </div>

                    {!sidebarCollapsed && tab.count !== null && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Secure Logout trigger */}
          <div className="px-3 pt-1">
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج وقفل لوحة التحكم؟')) {
                  localStorage.removeItem('s_azos_logged_in');
                  setIsLoggedIn(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl p-2 bg-rose-50 hover:bg-rose-105 text-rose-600 dark:bg-rose-955/20 dark:hover:bg-rose-900/40 dark:text-rose-400 text-xs font-black transition cursor-pointer"
              title="تسجيل الخروج من النظام"
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span>تسجيل الخروج</span>}
            </button>
          </div>

          {/* Sidebar Footer with system branding */}
          <div className="px-3 pt-3 border-t border-slate-150 dark:border-white/5">
            <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-[#111a2f] border border-slate-150 dark:border-white/5 flex items-center justify-center gap-2 text-center text-xs text-slate-450 ${
              sidebarCollapsed ? 'flex-col' : 'flex-row'
            }`}>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {!sidebarCollapsed && <span className="text-[10px] font-bold">باقة الحفظ محلي نشط</span>}
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA ON THE RIGHT (Main content view) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative custom-scrollbar">
          
          {/* ======================= TABS 0: DASHBOARD HOME (الرئيسية) ======================= */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              {/* Main Welcome Hero Badge */}
              <div className="bg-gradient-to-tr from-teal-700 via-emerald-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full" />
                <div className="relative z-10 space-y-2">
                  <span className="bg-white/15 px-3 py-1 text-[11px] font-bold text-white rounded-full border border-white/10 uppercase tracking-widest inline-block mb-1">
                    لوحة تحكم معاصرة لعام 2026
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-sans text-white leading-tight">
                    أهلاً بك مجدداً في {officeName}! 🌸🌤️
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-100 max-w-2xl leading-relaxed">
                    هذا هو مركز العمل الموحد الخاص بك. يمكنك تدوين وحساب رسوم المتابعة بالواتساب للعملاء، صياغة المعاريض الذكائية، مراجعة وتعديل الروابط والتحقق من سير المعاملات الجارية اليومية لعملائك بكل سهولة وسرعة.
                  </p>
                </div>
              </div>

              {/* CORE METRIC STAT CARDS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Platforms stat */}
                <div className="bg-white dark:bg-immersive-card p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs transition hover:scale-102 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">المنصات المفعلة للوصول</span>
                    <Layers className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black font-mono text-slate-800 dark:text-white block">{platforms.length}</span>
                    <span className="text-[10px] text-slate-400">سجل مفتاح حكومي</span>
                  </div>
                </div>

                {/* 2. Transactions stat */}
                <div className="bg-white dark:bg-immersive-card p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs transition hover:scale-102 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">المعاملات النشطة والجارية</span>
                    <ClipboardCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black font-mono text-slate-800 dark:text-white block">
                      {tasks.filter(t => t.status !== 'completed').length}
                    </span>
                    <span className="text-[10px] text-slate-400">معاملة تحت التنسيق والتدقيق</span>
                  </div>
                </div>

                {/* 3. Messages templates */}
                <div className="bg-white dark:bg-immersive-card p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs transition hover:scale-102 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">قوالب الرسائل الجاهزة</span>
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black font-mono text-slate-800 dark:text-white block">{templates.length}</span>
                    <span className="text-[10px] text-slate-400">قالب مراسلة واتساب</span>
                  </div>
                </div>

                {/* 4. Notes tracker */}
                <div className="bg-white dark:bg-immersive-card p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xs transition hover:scale-102 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">المذكرات المؤقتة الصوفية</span>
                    <NotebookPen className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black font-mono text-slate-800 dark:text-white block">{notes.length}</span>
                    <span className="text-[10px] text-slate-400">ملاحظة مسودة محفوظة</span>
                  </div>
                </div>

              </div>

              {/* QUICK NAVIGATION ACTIONS AND RECENT TRANSACTIONS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Dashboard Guides & shortcuts - Col 7 */}
                <div className="lg:col-span-8 space-y-5 bg-white/70 dark:bg-immersive-card/50 p-5 rounded-2xl border border-slate-200/55 dark:border-white/5">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <TrendingUp className="h-4.5 w-4.5 text-indigo-505" />
                    <span>عمليات الوصول السريعة (اختصارات بنقرة واحدة)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('platforms')}
                      className="p-3.5 rounded-xl bg-white dark:bg-immersive-card border border-slate-200/60 dark:border-white/5 hover:border-emerald-500 text-right transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">بوابة المنصات والخدمات</h4>
                        <p className="text-[10px] text-slate-400 mt-1">تصفية ودخول 24 منصة حكومية رسمية</p>
                      </div>
                      <ChevronLeft className="h-4.5 w-4.5 text-emerald-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="p-3.5 rounded-xl bg-white dark:bg-immersive-card border border-slate-200/60 dark:border-white/5 hover:border-amber-500 text-right transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">تسجيل ومتابعة معاملة للعميل</h4>
                        <p className="text-[10px] text-slate-400 mt-1">إضافة حالات الدفع والتنبيهات المواتية</p>
                      </div>
                      <ChevronLeft className="h-4.5 w-4.5 text-amber-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('assistant')}
                      className="p-3.5 rounded-xl bg-white dark:bg-immersive-card border border-slate-200/60 dark:border-white/5 hover:border-orange-500 text-right transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">تفعيل مستشارك الذكي</h4>
                        <p className="text-[10px] text-slate-400 mt-1">المساعدة السحابية في صياغة المعاريض ومعرفة مكوس قوى</p>
                      </div>
                      <ChevronLeft className="h-4.5 w-4.5 text-orange-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="p-3.5 rounded-xl bg-white dark:bg-immersive-card border border-slate-200/60 dark:border-white/5 hover:border-purple-500 text-right transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">التقويم والتواريخ (ميلادي/هجري)</h4>
                        <p className="text-[10px] text-slate-400 mt-1">المحولات والتقاويم الشهرية ومواسم السعودية</p>
                      </div>
                      <ChevronLeft className="h-4.5 w-4.5 text-purple-500" />
                    </button>
                  </div>

                  {/* System Tip Banner */}
                  <div className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-right">
                    <p className="text-[11px] text-slate-500 dark:text-slate-350 leading-relaxed font-semibold">
                      💡 مكتبك يقوم بحفظ البيانات تلقائياً في المتصفح! لإرسال النسخة الاحتياطية لجهاز آخر أو زميل معكم في مكاتب الخدمات، تفضل بزيارة صفحة "الإعدادات" ثم اضغط على "تنزيل أرشفة" لتصدير ملف البيانات.
                    </p>
                  </div>
                </div>

                {/* Mini pending transactions Overview list - Col 5 */}
                <div className="lg:col-span-4 bg-white/70 dark:bg-immersive-card text-right p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5 flex items-center justify-between">
                      <span>آخر المعاملات تحت الإجراء</span>
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                    </h3>

                    {tasks.filter(t => t.status !== 'completed').length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-[11px] font-bold">
                        رائع! لا توجد معاملات معلقة تحت التنفيذ حالياً.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
                        {tasks.filter(t => t.status !== 'completed').slice(0, 4).map((tk) => {
                          const targetPlat = platforms.find(p => p.id === tk.platformId);
                          return (
                            <div key={tk.id} className="p-2.5 bg-slate-50 dark:bg-immersive-input-bg rounded-xl border border-slate-200/30 text-right text-xs">
                              <span className="font-black text-slate-800 dark:text-white block leading-tight">{tk.title}</span>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-450 shrink-0">
                                <span className="font-semibold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full">
                                  {tk.status === 'pending' ? 'بانتظار الموافقة' : 'قيد المتابعة'}
                                </span>
                                <span>العميل: {tk.clientName}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="w-full mt-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-[#152033] dark:hover:bg-[#1b2a45] dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <span>فتح جدول المعاملات الكامل للعملاء</span>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ======================= TABS 1: GOVERNMENT PLATFORMS HUB (المنصات) ======================= */}
          {activeTab === 'platforms' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              <div className="bg-white/75 dark:bg-immersive-card rounded-2xl p-4.5 shadow-xs border border-slate-200/60 dark:border-white/5 backdrop-blur-md space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  
                  {/* Search bar specifically for portals */}
                  <div className="relative w-full md:w-96">
                    <input
                      type="text"
                      placeholder="ابحث باسم الخدمة، الجهة الحكومية، أو الرابط (مثال: قوى, مساند...)"
                      value={platformSearch}
                      onChange={(e) => setPlatformSearch(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-3 pr-10 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-555 dark:focus:border-indigo-505 font-bold transition"
                    />
                    <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>

                  {/* Filter tabs categories badges list */}
                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
                    {categoryFilterTags.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => setSelectedCategory(tag.value)}
                        className={`text-[11px] font-black px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                          selectedCategory === tag.value
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-705'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Platform usage stats */}
                <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/40 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold">مجموع البوابات المسجلة:</span>
                    <span className="font-mono font-black text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-705 px-2 py-0.5 rounded">{filteredPlatforms.length} من أصل {platforms.length}</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <p className="text-[10px] text-slate-450 italic">★ تستطيع re-order المنصات بسلاسة باستخدام الأسهم الجانبية بالبطاقة.</p>
                    <button
                      onClick={() => setIsAddPlatformOpen(true)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>إضافة رابط منصة مخصص</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento grid layout */}
              {paginatedPlatforms.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700/60 p-6 flex flex-col items-center justify-center">
                  <Compass className="h-10 w-10 text-slate-300 dark:text-slate-650 mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white">لا توجد بوابات ومفاتيح تطابق هذا البحث</h3>
                  <p className="text-xs text-slate-450 mt-1">جرب البحث بعبارة أخرى أو تراجع عن فلترة الاختصار.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {paginatedPlatforms.map((plat) => {
                      const masterIdx = platforms.findIndex(p => p.id === plat.id);
                      return (
                        <PlatformCard
                          key={plat.id}
                          platform={plat}
                          isFirst={masterIdx === 0}
                          isLast={masterIdx === platforms.length - 1}
                          onMoveForward={() => handleMovePlatformForward(masterIdx)}
                          onMoveBackward={() => handleMovePlatformBackward(masterIdx)}
                          onDelete={() => handleDeletePlatform(plat.id)}
                        />
                      );
                    })}
                  </div>

                  {/* Total platform paginations control */}
                  {totalPlatformPages > 1 && (
                    <div className="flex items-center justify-center gap-3 bg-white dark:bg-immersive-card p-4 rounded-2xl shadow-xs border border-slate-200/50 dark:border-white/5 max-w-md mx-auto">
                      <button
                        onClick={() => setPlatformPage(prev => Math.max(1, prev - 1))}
                        disabled={platformPage === 1}
                        className={`p-2 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          platformPage === 1
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-650 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span>الصفحة السابقة</span>
                      </button>

                      <div className="text-xs font-black text-slate-550 dark:text-slate-300 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                        صفحة <span className="font-mono text-emerald-600 dark:text-emerald-450">{platformPage}</span> من <span className="font-mono">{totalPlatformPages}</span>
                      </div>

                      <button
                        onClick={() => setPlatformPage(prev => Math.min(totalPlatformPages, prev + 1))}
                        disabled={platformPage === totalPlatformPages}
                        className={`p-2 rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer ${
                          platformPage === totalPlatformPages
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-650 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>الصفحة التالية</span>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ======================= TABS 2: TRANSACTIONS (المعاملات والطلبات) ======================= */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in text-right">
              <TaskTracker tasks={tasks} platforms={platforms} onSaveTasks={handleSaveTasks} />
            </div>
          )}

          {/* ======================= TABS 3: STICKY NOTES (الملاحظات) ======================= */}
          {activeTab === 'notes' && (
            <div className="space-y-6 animate-fade-in text-right">
              <QuickNotes notes={notes} onSaveNotes={handleSaveNotes} />
            </div>
          )}

          {/* ======================= TABS 4: MESSAGE TEMPLATES (النصوص والرسائل) ======================= */}
          {activeTab === 'templates' && (
            <div className="space-y-6 animate-fade-in text-right">
              <ReadyTemplates templates={templates} onSaveTemplates={handleSaveTemplates} />
            </div>
          )}

          {/* ======================= TABS 5: CALENDAR (التقويم والتواريخ) ======================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fade-in">
              <CalendarPage />
            </div>
          )}

          {/* ======================= TABS 6: FEE CALCULATOR (حاسبة الرسوم الكلف) ======================= */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-fade-in text-right">
              <FeeCalculator />
              
              <div className="bg-white/90 dark:bg-immersive-card rounded-2xl p-5 border border-slate-250/50 dark:border-white/5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                    <HelpCircle className="h-5 w-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white">دليل فحص وسداد المكوس الحكومية بسلامة</h3>
                    <ul className="mt-2 text-[11px] text-slate-550 dark:text-slate-350 list-disc list-inside space-y-2 leading-relaxed font-semibold">
                      <li>يرجى من موظفي مركز المعاملات دائماً إرسال تفصيلات الفاتورة للعميل مع تنبيه بضرورة التحقق من رمز التحقق نفاذ أو الموافقة الرسمية من حسابه لإنجاز العملية بنقرة واحدة.</li>
                      <li>لتفصيل حساب المعاملة كفاح كفيل، كفالة مساند الاستقدام، تم تخصيص مبالغ السعي كأجر خدمة ثابت للمكتب.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= TABS 7: SMART AI CHAT ASSISTANT (المساعد الذكي) ======================= */}
          {activeTab === 'assistant' && (
            <div className="space-y-6 animate-fade-in text-right">
              <SmartAssistant />
            </div>
          )}

          {/* ======================= TABS 8: SYSTEM CONFIGURATIONS (الإعدادات) ======================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-right">
              <SettingsPage 
                officeName={officeName}
                onSetOfficeName={setOfficeName}
                defaultCommission={defaultCommission}
                onSetDefaultCommission={setDefaultCommission}
                onResetAllData={handleResetAllData}
                isCloudSyncEnabled={isCloudSyncEnabled}
                setIsCloudSyncEnabled={setIsCloudSyncEnabled}
                currentUser={currentUser}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleSignOut={handleGoogleSignOut}
                onSyncLocalToCloud={handleSyncLocalToCloud}
                onFetchFromCloud={handleFetchFromCloud}
                isSyncing={isSyncing}
                syncStatus={syncStatus}
                firebaseConfig={finalConfig}
              />
            </div>
          )}

        </main>

      </div>

      {/* FOOTER BAR WITH SYSTEM PRIVACY LABELS */}
      <footer className="bg-white/60 dark:bg-[#0b1322]/60 border-t border-slate-200/50 dark:border-white/5 backdrop-blur-md transition-all py-6 text-center select-none shrink-0 z-10 text-right sm:text-center px-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          بوابة الخدمات العامة السعودية © {new Date().getFullYear()} — صُممت اللوحة خصيصاً لتيسير وتسريع الوصول إلى كافة روابط المعاملات ومتابعة شؤون المراجعين.
        </p>
      </footer>

      {/* MODAL WINDOW FOR ADDING NEW LOG PORTAL */}
      <PlatformManagerModal
        isOpen={isAddPlatformOpen}
        onClose={() => setIsAddPlatformOpen(false)}
        onAddPlatform={handleAddPlatform}
      />

    </div>
  );
}
