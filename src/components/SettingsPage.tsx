import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  RefreshCw, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  Cpu, 
  CloudLightning, 
  Layers, 
  Database,
  Lock,
  LogOut,
  Sparkles,
  Info,
  Copy
} from "lucide-react";
import { Platform, Task, SavedTemplate, QuickNote } from "../types";

interface SettingsPageProps {
  officeName: string;
  onSetOfficeName: (name: string) => void;
  defaultCommission: number;
  onSetDefaultCommission: (comm: number) => void;
  onResetAllData: () => void;
  
  // Firebase configuration integration props
  isCloudSyncEnabled: boolean;
  setIsCloudSyncEnabled: (enabled: boolean) => void;
  currentUser: any;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onSyncLocalToCloud: () => Promise<void>;
  onFetchFromCloud: () => Promise<void>;
  isSyncing: boolean;
  syncStatus: string | null;
  firebaseConfig: any;
}

export default function SettingsPage({
  officeName,
  onSetOfficeName,
  defaultCommission,
  onSetDefaultCommission,
  onResetAllData,
  
  isCloudSyncEnabled,
  setIsCloudSyncEnabled,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncLocalToCloud,
  onFetchFromCloud,
  isSyncing,
  syncStatus,
  firebaseConfig
}: SettingsPageProps) {
  
  const [localOffice, setLocalOffice] = useState(officeName);
  const [localComm, setLocalComm] = useState(defaultCommission);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState<string | null>(null);

  useEffect(() => {
    setLocalOffice(officeName);
  }, [officeName]);

  useEffect(() => {
    setLocalComm(defaultCommission);
  }, [defaultCommission]);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    onSetOfficeName(localOffice.trim());
    onSetDefaultCommission(localComm >= 0 ? localComm : 0);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    try {
      const backupObj = {
        exportDate: new Date().toISOString(),
        officeName: officeName,
        defaultCommission: defaultCommission,
        platforms: JSON.parse(localStorage.getItem("s_dashboard_platforms") || "[]"),
        tasks: JSON.parse(localStorage.getItem("s_dashboard_tasks") || "[]"),
        templates: JSON.parse(localStorage.getItem("s_dashboard_templates") || "[]"),
        notes: JSON.parse(localStorage.getItem("s_dashboard_notes") || "[]"),
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `لوحة_الخدمات_النسخة_الاحتياطية_${new Date().toLocaleDateString("ar-SA")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e: any) {
      alert("عذراً، حدث خطأ أثناء تحضير ملف النسخة الاحتياطية: " + e.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        if (!parsed.exportDate) {
          throw new Error("ملف النسخ الاحتياطي غير صالح أو مفقود الهيكل");
        }

        if (parsed.officeName) onSetOfficeName(parsed.officeName);
        if (parsed.defaultCommission) onSetDefaultCommission(parsed.defaultCommission);
        
        if (parsed.platforms && Array.isArray(parsed.platforms)) {
          localStorage.setItem("s_dashboard_platforms", JSON.stringify(parsed.platforms));
        }
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          localStorage.setItem("s_dashboard_tasks", JSON.stringify(parsed.tasks));
        }
        if (parsed.templates && Array.isArray(parsed.templates)) {
          localStorage.setItem("s_dashboard_templates", JSON.stringify(parsed.templates));
        }
        if (parsed.notes && Array.isArray(parsed.notes)) {
          localStorage.setItem("s_dashboard_notes", JSON.stringify(parsed.notes));
        }

        setImportStatus("✓ تم استيراد وتطبيق البيانات والمحفظة بنجاح! سيتم تحديث الصفحة لتطبيق الإعدادات.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err: any) {
        setImportStatus("❌ خطأ: ملف الاستيراد ليس في صيغة JSON صالحة لنظام مكتبنا " + err.message);
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleFullReset = () => {
    if (confirm("🚨 تنبيه هام جداً!\n\nهل أنت متأكد من رغبتك في حذف كل السجلات؟ سيقوم هذا الإجراء بمسح كافة المعاملات والمذكرات والروابط المضافة، وإرجاع بيانات المنصات والرسائل إلى وضعها الافتراضي لحالة المصنع.\n\nهذا الإجراء لا يمكن التراجع عنه.")) {
      onResetAllData();
      window.location.reload();
    }
  };

  const copyToClipboard = (keyStr: string, valueStr: string) => {
    navigator.clipboard.writeText(valueStr);
    setCopiedEnv(keyStr);
    setTimeout(() => setCopiedEnv(null), 2500);
  };

  return (
    <div id="settings-workspace-page" className="grid grid-cols-1 md:grid-cols-12 gap-6 text-right items-start">
      
      {/* Configuration Form Column - Col 7 */}
      <div className="md:col-span-12 lg:col-span-7 space-y-6">
        <form onSubmit={handleSaveConfigs} className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
          
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div className="p-2 bg-indigo-50/10 text-indigo-650 dark:text-indigo-400 rounded-lg">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">إعدادات هوية مكتب المعاملات والربط السحابي</h2>
              <p className="text-[11px] text-slate-400">تخصيص هوية المكتب وحفظها على السحابة والمزامنة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">اسم مكتب الخدمات الخاص بك:</label>
              <input
                type="text"
                required
                value={localOffice}
                onChange={(e) => setLocalOffice(e.target.value)}
                placeholder="مثال: مكتب الفرسان للخدمات العامة"
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 focus:bg-white transition"
              />
              <span className="text-[10px] text-slate-400 block mt-1">يظهر كشعار رئيسي في واجهات النظام والرسائل والتقارير.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">أتعاب السعي الافتراضية (ريال):</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={localComm}
                  onChange={(e) => setLocalComm(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="مثال: 100"
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 pl-10 pr-3 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 focus:bg-white font-mono transition text-left"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">ريال</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">تستخدم تلقائياً لحساب أتعاب سعي المعاملات الجديدة.</span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center animate-pulse">
              ✓ تم حفظ هوية المكتب ومعدلات الأتعاب محلياً وتطبيقها التلقائي!
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200/40 dark:border-white/5">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer dark:bg-gradient-to-tr dark:from-indigo-600 dark:to-indigo-500"
            >
              حفظ وتطبيق البيانات
            </button>
          </div>
        </form>

        {/* CLOUD CONNECTION CONFIGURATION CARD */}
        <div id="firebase-cloud-sync-card" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white">بوابة الربط مع Firebase & Vercel</h3>
                <p className="text-[11px] text-slate-400">حفظ وحماية السجلات من الضياع عبر المزامنة السحابية المباشرة</p>
              </div>
            </div>
            
            {/* Enabled Badge Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-350">المزامنة مع السحابة:</span>
              <button
                type="button"
                onClick={() => setIsCloudSyncEnabled(!isCloudSyncEnabled)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isCloudSyncEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isCloudSyncEnabled ? "-translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed font-semibold">
            عند تفعيل نمط "المزامنة"، يمكنك ربط لوحة التحكم هذه مباشرة بـ <strong className="text-indigo-600 dark:text-indigo-400">Firebase Firestore</strong> لحفظ المعاملات، المنصات، قوالب الرسائل الجاهزة والملاحظات تلقائياً. الميزة مثالية عند رفع التطبيق على منصة <strong className="text-indigo-600 dark:text-indigo-400">Vercel</strong> للحصول على حماية أبدية لبياناتك ومشاركتها مع موظفي المكتب من أي جهاز.
          </p>

          {isCloudSyncEnabled && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5 animate-fade-in">
              
              {/* Connection Status Badge */}
              <div className="p-4 bg-slate-50 dark:bg-[#111a2f] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                <div>
                  <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                    <span className={`w-2.5 h-2.5 rounded-full animate-ping ${currentUser ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span className="text-xs font-bold text-slate-700 dark:text-white">
                      حالة الربط السحابي:
                    </span>
                    <span className={`text-xs font-black ${currentUser ? "text-emerald-500" : "text-amber-500"}`}>
                      {currentUser ? "متصل - مزامنة نشطة" : "غير مصرح (بانتظار تسجيل الدخول)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-450 mt-1">
                    {currentUser 
                      ? `أنت متصل بالبريد السحابي: ${currentUser.email}` 
                      : "يرجى تسجيل الدخول باستخدام حساب جوجل المرتبط بالمنصة."}
                  </p>
                </div>

                {!currentUser ? (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer dark:bg-immersive-input-bg dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.414 0-6.19-2.776-6.19-6.19s2.776-6.19 6.19-6.19c1.55 0 2.964.57 4.053 1.503l3.05-3.045C18.913 1.832 15.776 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.703 0 12.333-5.388 12.333-12.24 0-.485-.05-1.002-.121-1.285h-12.21z" />
                    </svg>
                    <span>تسجيل الدخول عبر Google</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer dark:bg-rose-950/20 dark:text-rose-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                )}
              </div>

              {/* Sync Actions (only visible when logged in) */}
              {currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-indigo-500/10 bg-indigo-500/5 rounded-xl">
                  
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={onSyncLocalToCloud}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Upload className={`h-4 w-4 ${isSyncing ? "animate-bounce" : ""}`} />
                      <span>رفع البيانات الحالية للسحاب</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">أخذ بيانات المتصفح ورفعها لتصبح القيمة السحابية المشتركة.</p>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={onFetchFromCloud}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Download className={`h-4 w-4 ${isSyncing ? "animate-bounce" : ""}`} />
                      <span>سحب البيانات السحابية الحالية</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">الكتابة فوق البيانات المحلية بآخر تحديث موجود في سحابة Firestore.</p>
                  </div>

                </div>
              )}

              {syncStatus && (
                <div className="p-2.5 bg-blue-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 rounded-xl text-center text-[11px] font-bold animate-pulse">
                  {syncStatus}
                </div>
              )}

              {/* Advanced / Vercel Environment Variables Section */}
              <div className="space-y-2.5 bg-slate-50 dark:bg-immersive-input-bg p-4 rounded-xl border border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300">
                  <Info className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-black">ربط خيارات Vercel (متغيرات البيئة Environment Variables):</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  لضمان اتصال المنصة بالسحابة بعد رفعها على Vercel، يرجى نسخ ولصق متغيرات البيئة السرية التالية إلى إعدادات مشروعك في Vercel (Settings &gt; Environment Variables):
                </p>

                <div className="space-y-1.5 pt-1.5 text-xs font-mono">
                  {Object.entries(firebaseConfig).map(([key, val]) => {
                    const envKey = `VITE_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
                    const valStr = String(val);
                    const isCopied = copiedEnv === envKey;

                    return (
                      <div key={key} className="flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-[#111a2f] border border-slate-200/50 dark:border-white/5 rounded-lg text-left">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(envKey, valStr)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500 transition cursor-pointer"
                            title="نسخ القيمة"
                          >
                            {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px] sm:max-w-[200px]" title={valStr}>
                            {valStr ? (valStr.length > 20 ? `${valStr.substring(0, 15)}...` : valStr) : "فارغ"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-emerald-400 font-sans text-right select-all">
                          {envKey}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Backup, Purge & Help Diagnostic Column - Col 5 */}
      <div className="md:col-span-12 lg:col-span-5 space-y-6">
        
        {/* BACKUP & RESTORE PANEL */}
        <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4 text-right">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 justify-end">
            <span>النسخ الاحتياطي اليدوي والتنزيل</span>
            <Download className="h-4 w-4 text-indigo-500" />
          </h3>
          
          <p className="text-[11.5px] text-slate-500 dark:text-slate-350 leading-relaxed font-semibold">
            حفاظاً على مصلحتك، يمكنك سحب نسخة سريعة من كافة بياناتك وتنزيلها محلياً على جهازك لاستيرادها يدوياً عند الحاجة.
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Export */}
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 dark:bg-slate-800 dark:border-white/5 dark:text-slate-200 dark:hover:bg-slate-705 text-slate-750 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-indigo-500" />
              <span>تنزيل أرشفة بيانات النظام (JSON)</span>
            </button>

            {/* Import */}
            <div className="relative text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                id="import-backup-file"
                className="hidden"
              />
              <label
                htmlFor="import-backup-file"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 dark:bg-slate-800 dark:border-white/5 dark:text-slate-200 dark:hover:bg-slate-705 text-slate-755 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="h-4 w-4 text-emerald-500" />
                <span>رفع واستعادة أرشفة سابقة</span>
              </label>
            </div>
          </div>

          {importStatus && (
            <p className="text-[11px] font-bold text-center text-amber-600 dark:text-indigo-400 whitespace-pre-line animate-pulse leading-normal bg-indigo-500/5 p-2 rounded-xl mt-2">
              {importStatus}
            </p>
          )}
        </div>

        {/* FULL PURGE CACHE AND DIAGNOSTIC STATS */}
        <div className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-200/50 dark:border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 justify-end">
            <span>فحص وتهيئة ومراقبة النظام</span>
            <Cpu className="h-4 w-4 text-indigo-500" />
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                خادم الذكاء الاصطناعي:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">نشط (Gemini 3.5)</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                نمط تأمين البيانات:
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {isCloudSyncEnabled ? "مزامنة سحابية هجينة" : "محلي على المتصفح"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/40 dark:border-white/5">
            <button
              type="button"
              onClick={handleFullReset}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 dark:bg-rose-955/20 dark:border-rose-900/35 dark:hover:bg-rose-900/40 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>إعادة ضبط المصنع بالكامل</span>
            </button>
            <span className="text-[9.5px] text-slate-400 block text-center mt-1.5 leading-normal">تنبيه: يفقدك كل المدونات والعملاء للأبعد.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
