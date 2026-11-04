import React, { useState, useMemo } from 'react';
import { PetitionDraft } from '../types';
import { 
  ScrollText, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Edit3, 
  Eye, 
  Sparkles, 
  FileText,
  User, 
  CreditCard, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar as CalendarIcon,
  HelpCircle,
  Share2,
  BookmarkCheck,
  ChevronLeft
} from 'lucide-react';
import { INITIAL_PETITIONS } from '../data/initialData';

interface MaareedDraftsProps {
  petitions: PetitionDraft[];
  onSavePetitions: (petitions: PetitionDraft[]) => void;
}

export default function MaareedDrafts({ petitions, onSavePetitions }: MaareedDraftsProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Currently selected petition
  const [activePetitionId, setActivePetitionId] = useState<string>(
    petitions.length > 0 ? petitions[0].id : 'pet-istirham-ebad'
  );

  // Active petition object
  const currentPetition = useMemo(() => {
    return petitions.find(p => p.id === activePetitionId) || petitions[0] || null;
  }, [petitions, activePetitionId]);

  // Document live text & edit mode
  const [docContent, setDocContent] = useState<string>(currentPetition ? currentPetition.content : '');
  const [isEditingMode, setIsEditingMode] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // When active petition changes, reset editor content unless custom edited
  const handleSelectPetition = (petition: PetitionDraft) => {
    setActivePetitionId(petition.id);
    setDocContent(petition.content);
    setIsEditingMode(false);
  };

  // Quick Placeholders State for Auto-Fill
  const [fillName, setFillName] = useState<string>('');
  const [fillId, setFillId] = useState<string>('');
  const [fillPhone, setFillPhone] = useState<string>('');
  const [fillCity, setFillCity] = useState<string>('الرياض');
  const [fillAuthority, setFillAuthority] = useState<string>('');
  const [fillDate, setFillDate] = useState<string>(() => {
    return new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  // Category list
  const categoryFilters = [
    { id: 'الكل', label: 'جميع المعاريض' },
    { id: 'istirham', label: 'استرحام وعفو' },
    { id: 'assistance', label: 'مساعدات وسداد ديون' },
    { id: 'diwan', label: 'الديوان الملكي والإمارة' },
    { id: 'passports', label: 'جوازات واستقدام' },
    { id: 'grievance', label: 'تظلمات وظروف خاصة' },
    { id: 'custom', label: 'معاريضي المضافة' }
  ];

  // Filtered list
  const filteredPetitions = useMemo(() => {
    return petitions.filter(p => {
      const matchSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.targetAuthority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = 
        selectedCategory === 'الكل' || 
        (selectedCategory === 'custom' ? p.isCustom : p.category === selectedCategory);

      return matchSearch && matchCategory;
    });
  }, [petitions, searchTerm, selectedCategory]);

  // Apply placeholders into active text
  const handleApplyPlaceholders = () => {
    if (!currentPetition) return;
    let text = currentPetition.content;

    if (fillName.trim()) {
      text = text.replaceAll('[اسم مقدم المعروض]', fillName.trim());
      text = text.replaceAll('[اسم مقدم الطلب]', fillName.trim());
    }
    if (fillId.trim()) {
      text = text.replaceAll('[رقم الهوية]', fillId.trim());
      text = text.replaceAll('[رقم الإقامة]', fillId.trim());
    }
    if (fillPhone.trim()) {
      text = text.replaceAll('[رقم الجوال]', fillPhone.trim());
    }
    if (fillCity.trim()) {
      text = text.replaceAll('[المدينة]', fillCity.trim());
      text = text.replaceAll('[اسم المنطقة]', fillCity.trim());
    }
    if (fillAuthority.trim()) {
      text = text.replaceAll('[اسم أمير المنطقة]', fillAuthority.trim());
      text = text.replaceAll('[اسم الوزارة]', fillAuthority.trim());
    }
    if (fillDate.trim()) {
      text = text.replaceAll('[التاريخ]', fillDate.trim());
    }

    setDocContent(text);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(docContent);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Save changes to current petition
  const handleSaveChanges = () => {
    if (!currentPetition) return;
    const updated = petitions.map(p => 
      p.id === currentPetition.id ? { ...p, content: docContent } : p
    );
    onSavePetitions(updated);
    setSaveSuccess(true);
    setIsEditingMode(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset current petition text to initial default
  const handleResetToDefault = () => {
    if (!currentPetition) return;
    const initial = INITIAL_PETITIONS.find(p => p.id === currentPetition.id);
    if (initial) {
      setDocContent(initial.content);
      const updated = petitions.map(p => 
        p.id === currentPetition.id ? { ...p, content: initial.content } : p
      );
      onSavePetitions(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Native Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>${currentPetition ? currentPetition.title : 'معروض رسمي'}</title>
          <style>
            @page {
              size: A4;
              margin: 25mm 20mm 20mm 20mm;
            }
            body {
              font-family: 'Traditional Arabic', 'Amiri', 'Segoe UI', Tahoma, sans-serif;
              direction: rtl;
              text-align: justify;
              line-height: 1.9;
              font-size: 16pt;
              color: #111;
              padding: 0;
              margin: 0;
              background: #fff;
            }
            .header-bismillah {
              text-align: center;
              font-size: 19pt;
              font-weight: bold;
              margin-bottom: 25px;
              color: #0b2545;
            }
            .content-body {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer-notes {
              margin-top: 40px;
              border-top: 1px dashed #ccc;
              padding-top: 10px;
              font-size: 11pt;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="content-body">${docContent}</div>
          <div class="footer-notes">حرر وطبع عبر بوابة الخدمات العامة السعودية</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Download as text file (.txt)
  const handleDownloadTxt = () => {
    if (!currentPetition) return;
    const element = document.createElement("a");
    const file = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentPetition.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Add custom petition modal state
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthority, setNewAuthority] = useState('');
  const [newCategory, setNewCategory] = useState<'istirham' | 'diwan' | 'assistance' | 'passports' | 'grievance'>('istirham');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreateCustomPetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const categoryLabelMap = {
      istirham: 'استرحام وعفو',
      diwan: 'الديوان الملكي والإمارة',
      assistance: 'مساعدات وسداد ديون',
      passports: 'جوازات واستقدام',
      grievance: 'تظلمات وظروف خاصة'
    };

    const newDraft: PetitionDraft = {
      id: `custom-pet-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: categoryLabelMap[newCategory],
      targetAuthority: newAuthority.trim() || 'الجهة المختصة الموقرة',
      description: newDescription.trim() || 'معروض مخصص من إعداد المكتب',
      content: newContent.trim(),
      isCustom: true
    };

    const updated = [newDraft, ...petitions];
    onSavePetitions(updated);
    setActivePetitionId(newDraft.id);
    setDocContent(newDraft.content);

    // Reset form
    setNewTitle('');
    setNewAuthority('');
    setNewDescription('');
    setNewContent('');
    setIsAddCustomOpen(false);
  };

  // Delete custom petition
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المعروض المخصص؟')) {
      const remaining = petitions.filter(p => p.id !== id);
      onSavePetitions(remaining);
      if (activePetitionId === id && remaining.length > 0) {
        setActivePetitionId(remaining[0].id);
        setDocContent(remaining[0].content);
      }
    }
  };

  return (
    <div id="maareed-drafts-root" className="space-y-6 text-right select-text">
      
      {/* Top Banner & Header */}
      <div className="bg-white/80 dark:bg-immersive-card rounded-2xl p-5 shadow-xs border border-slate-200/60 dark:border-white/5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-2xl text-white shadow-md">
              <ScrollText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-800 dark:text-white font-sans">
                  مسودات ومعاريض واسترحامات رسمية
                </h2>
                <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  صياغات معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                صيغ رسمية وقانونية محكمة للاسترحامات، طلبات الديوان الملكي، الإمارة، الجوازات، والديون جاهزة للطباعة والتعبئة الفورية
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsAddCustomOpen(!isAddCustomOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة صيغة معروض جديد</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-4 no-scrollbar flex-nowrap border-t border-slate-200/40 dark:border-white/5 pt-3">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-black px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center justify-center cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-[#152033] dark:text-slate-350 dark:hover:bg-[#1b2a45]'
              }`}
            >
              {cat.label}
              {cat.id === 'custom' && (
                <span className="mr-1.5 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {petitions.filter(p => p.isCustom).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modal / Collapse for adding custom petition */}
      {isAddCustomOpen && (
        <form onSubmit={handleCreateCustomPetition} className="bg-amber-50/40 dark:bg-[#152033]/80 p-5 rounded-2xl border border-amber-200 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-white/5">
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-400 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>إضافة مسودة معروض مخصصة جديدة للمكتب</span>
            </h3>
            <span className="text-[11px] text-slate-400">ستحفظ في متصفحك بشكل دائم</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان المعروض:</label>
              <input
                type="text"
                required
                placeholder="مثال: معروض طلب تسوية نزاع تجاري..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white dark:bg-[#0f172a] p-2.5 outline-none dark:border-white/10 dark:text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">الجهة الموجه إليها المعروض:</label>
              <input
                type="text"
                placeholder="مثال: معالي وزير التجارة حفظه الله"
                value={newAuthority}
                onChange={(e) => setNewAuthority(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white dark:bg-[#0f172a] p-2.5 outline-none dark:border-white/10 dark:text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">التصنيف:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white dark:bg-[#0f172a] p-2.5 outline-none dark:border-white/10 dark:text-white focus:border-amber-500"
              >
                <option value="istirham">استرحام وعفو</option>
                <option value="diwan">الديوان الملكي والإمارة</option>
                <option value="assistance">مساعدات وسداد ديون</option>
                <option value="passports">جوازات واستقدام</option>
                <option value="grievance">تظلمات وظروف خاصة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">وصف مختصر للغرض من المعروض:</label>
            <input
              type="text"
              placeholder="مثال: خطاب استثنائي لرفع الحظر عن استيراد بضاعة..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white dark:bg-[#0f172a] p-2.5 outline-none dark:border-white/10 dark:text-white focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">النص الكامل للصيغة (يمكنك استخدام الأقواس مثل [اسم مقدم المعروض]):</label>
            <textarea
              rows={8}
              required
              placeholder="اكتب أو الصق نص المعروض كاملاً هنا..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white dark:bg-[#0f172a] p-3 outline-none dark:border-white/10 dark:text-white focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCustomOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>حفظ الصيغة في المسودات</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Column: Search & Petition Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في المعاريض (استرحام، سجين، ديوان، إبعاد، نقل...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-bold rounded-2xl border border-slate-200 bg-white dark:bg-immersive-card dark:border-white/10 py-3 pl-3 pr-10 outline-none dark:text-white focus:border-amber-500 shadow-2xs transition"
            />
            <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between px-1">
            <span>النتائج المتاحة ({filteredPetitions.length})</span>
            <span>انقر لاختيار وتعبئة المعروض</span>
          </div>

          {/* Cards List with smooth scroll */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPetitions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-immersive-card rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">لا توجد صيغ تطابق هذا البحث أو التصنيف</p>
              </div>
            ) : (
              filteredPetitions.map((pet) => {
                const isSelected = pet.id === activePetitionId;
                return (
                  <div
                    key={pet.id}
                    onClick={() => handleSelectPetition(pet)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group text-right ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 shadow-xs'
                        : 'bg-white/80 dark:bg-immersive-card border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            pet.category === 'istirham' 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                              : pet.category === 'assistance'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : pet.category === 'diwan'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {pet.categoryLabel}
                          </span>
                          {pet.isCustom && (
                            <span className="text-[9px] bg-purple-500/10 text-purple-600 px-1.5 py-0.2 rounded font-black">
                              مخصص
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-black truncate leading-snug ${
                          isSelected ? 'text-amber-900 dark:text-amber-300' : 'text-slate-800 dark:text-white'
                        }`}>
                          {pet.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {pet.description}
                        </p>

                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{pet.targetAuthority}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        {isSelected ? (
                          <div className="p-1 bg-amber-600 text-white rounded-full">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <ChevronLeft className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition" />
                        )}

                        {pet.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustom(pet.id, e)}
                            className="mt-4 p-1 text-slate-400 hover:text-rose-600 transition"
                            title="حذف هذا المعروض المخصص"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Left Column: Active Document Viewer & Quick Filler (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Placeholder Auto-Filler Bar */}
          <div className="bg-white/80 dark:bg-immersive-card rounded-2xl p-4 shadow-xs border border-slate-200/60 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-800 dark:text-white">
                  التعبئة الذكية لبيانات العميل بالمعروض
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                أدخل البيانات واضغط تطبيق لاستبدال كافة الأقواس تلقائياً
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>اسم مقدم الطلب:</span>
                </label>
                <input
                  type="text"
                  placeholder="الاسم الرباعي..."
                  value={fillName}
                  onChange={(e) => setFillName(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span>رقم الهوية / الإقامة:</span>
                </label>
                <input
                  type="text"
                  placeholder="10 أو 10 أرقام..."
                  value={fillId}
                  onChange={(e) => setFillId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>رقم الجوال:</span>
                </label>
                <input
                  type="text"
                  placeholder="05XXXXXXXX"
                  value={fillPhone}
                  onChange={(e) => setFillPhone(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>المدينة / المنطقة:</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: الرياض، مكة، القصيم..."
                  value={fillCity}
                  onChange={(e) => setFillCity(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>المسؤول الموجه إليه:</span>
                </label>
                <input
                  type="text"
                  placeholder="اسم الأمير أو الوزير..."
                  value={fillAuthority}
                  onChange={(e) => setFillAuthority(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>تاريخ المعروض:</span>
                </label>
                <input
                  type="text"
                  placeholder="تاريخ اليوم..."
                  value={fillDate}
                  onChange={(e) => setFillDate(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/70 p-2 outline-none dark:border-white/10 dark:bg-[#131b2b] dark:text-white focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplyPlaceholders}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>تطبيق البيانات على نص المعروض الحالي</span>
              </button>
            </div>
          </div>

          {/* Document Canvas & Toolbar */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/70 dark:border-white/10 relative">
            
            {/* Document Header & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-white/5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>{currentPetition ? currentPetition.title : 'نص المعروض'}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  {currentPetition ? currentPetition.targetAuthority : ''}
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setIsEditingMode(!isEditingMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    isEditingMode
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#152033] dark:text-slate-300 dark:hover:bg-[#1b2a45]'
                  }`}
                  title="تعديل أو كتابة نص حر"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isEditingMode ? 'وضع القراءة' : 'تعديل النص'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#152033] dark:text-slate-300 dark:hover:bg-[#1b2a45] flex items-center gap-1 transition cursor-pointer"
                  title="نسخ النص للحافظة"
                >
                  {copiedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSuccess ? 'تم النسخ!' : 'نسخ'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60 flex items-center gap-1 transition cursor-pointer"
                  title="طباعة المعروض بتنسيق رسمي A4"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>طباعة رسمية</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#152033] dark:text-slate-300 dark:hover:bg-[#1b2a45] transition cursor-pointer"
                  title="تنزيل كملف نصي .txt"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-[#152033] dark:text-slate-400 dark:hover:bg-[#1b2a45] transition cursor-pointer"
                  title="استعادة النص الأصلي الافتراضي"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Toasts */}
            {copiedSuccess && (
              <div className="my-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Check className="h-4 w-4" />
                <span>تم نسخ نص المعروض بالكامل إلى الحافظة بنجاح، يمكنك لصقه الآن في الوورد أو الواتساب أو الطباعة.</span>
              </div>
            )}

            {saveSuccess && (
              <div className="my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <BookmarkCheck className="h-4 w-4" />
                <span>تم تطبيق التغييرات وحفظ النص بنجاح!</span>
              </div>
            )}

            {/* Paper Document Preview Area */}
            <div className="mt-4 p-5 sm:p-8 bg-amber-50/20 dark:bg-[#0c1424] rounded-xl border border-amber-200/50 dark:border-white/5 font-sans min-h-[460px] text-right">
              {isEditingMode ? (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                    ✍️ أنت الآن في وضع التحرير المباشر: يمكنك تعديل النص بحرية وإضافة بياناتك ثم الضغط على "حفظ التعديلات".
                  </div>
                  <textarea
                    rows={18}
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#090f1d] p-4 outline-none dark:text-white leading-loose font-sans focus:border-amber-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>حفظ التعديلات على هذا المعروض</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm space-y-4">
                  {docContent}
                </div>
              )}
            </div>

            {/* Official Footer Notice */}
            <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                <span>نصيحة: يفضّل إرفاق التقارير الطبية، صكوك الإعالة، أو أرقام فواتير التنفيذ مع المعروض عند تقديمه.</span>
              </span>
              <button
                onClick={handlePrint}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>معاينة للطباعة الرسمية (A4)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
