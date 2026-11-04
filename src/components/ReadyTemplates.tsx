import React, { useState } from 'react';
import { SavedTemplate } from '../types';
import { MessageSquare, Plus, Copy, Trash, Check, Compass, Search, ScrollText } from 'lucide-react';

interface ReadyTemplatesProps {
  templates: SavedTemplate[];
  onSaveTemplates: (templates: SavedTemplate[]) => void;
  onNavigateToMaareed?: () => void;
}

export default function ReadyTemplates({ templates, onSaveTemplates, onNavigateToMaareed }: ReadyTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  
  // Create / Input states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('طلبات العناية بالعميل');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Active Copy States to display localized toast feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable preview area
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  
  // Status indicator feedback instead of alerts
  const [localSaveSuccess, setLocalSaveSuccess] = useState<boolean>(false);
  const [previewCopied, setPreviewCopied] = useState<boolean>(false);

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTemplate: SavedTemplate = {
      id: `template-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory
    };

    onSaveTemplates([newTemplate, ...templates]);
    setNewTitle('');
    setNewContent('');
    setIsAddOpen(false);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      onSaveTemplates(templates.filter(t => t.id !== id));
      if (editingTemplateId === id) {
        setEditingTemplateId(null);
        setEditingText('');
      }
    }
  };

  const handleCopyTemplate = (template: SavedTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy original template content
    navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectTemplateForEdit = (template: SavedTemplate) => {
    setEditingTemplateId(template.id);
    setEditingText(template.content);
    setLocalSaveSuccess(false);
    setPreviewCopied(false);
  };

  const handleUpdateTemplateContent = (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, content: editingText } : t);
    onSaveTemplates(updated);
    setLocalSaveSuccess(true);
    setTimeout(() => setLocalSaveSuccess(false), 3000);
  };

  // Categories available in the templates list
  const categories = ['الكل', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === 'الكل' || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div id="ready-templates-widget" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-white/5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-505/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white font-sans">الرسائل والنصوص الجاهزة للعملاء</h2>
            <p className="text-xs text-slate-400">قوالب رد مجهة سلفاً للمشاركة السريعة والنسخ الفوري</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة قالب</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddTemplate} className="mb-5 p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 dark:bg-[#152033]/60 dark:border-white/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">عنوان القالب:</label>
              <input
                type="text"
                placeholder="مثال: طلب سداد رسوم"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">التصنيف:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
              >
                <option value="طلبات العناية بالعميل">طلبات العناية بالعميل</option>
                <option value="تأكيد وإنجاز">تأكيد وإنجاز</option>
                <option value="فواتير وسداد">فواتير وسداد</option>
                <option value="تنبيهات وملاحظات">تنبيهات وملاحظات</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">محتوى الرسالة:</label>
            <textarea
              placeholder="اكتب الرسالة الجاهزة التي سترسلها للعملاء..."
              rows={4}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-indigo-500 transition"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/40 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              إضافة
            </button>
          </div>
        </form>
      )}

      {/* Quick link to official petitions & istirham drafts */}
      {onNavigateToMaareed && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2 min-w-0">
            <ScrollText className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs text-amber-900 dark:text-amber-300 font-bold truncate">
              تبحث عن صيغ استرحام رسمية، خطابات إمارة، أو معاريض ديوان ملكي؟
            </p>
          </div>
          <button
            onClick={onNavigateToMaareed}
            className="text-xs font-black px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
          >
            فتح المعاريض والاسترحامات
          </button>
        </div>
      )}

      {/* Grid Filter control & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث في نصوص وقوالب الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-indigo-500 transition"
            />
            <Search className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap sm:flex-wrap w-full sm:w-auto -mx-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] flex items-center justify-center ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Details Display: Templates list on right, interactive click-to-edit preview on left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Templates list */}
          <div className="lg:col-span-7 space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                لا توجد قوالب تطابق فئة الاختيار.
              </div>
            ) : (
              filteredTemplates.map((temp) => (
                <div
                  key={temp.id}
                  onClick={() => handleSelectTemplateForEdit(temp)}
                  className={`p-3.5 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                    editingTemplateId === temp.id
                      ? 'border-indigo-505 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10'
                      : 'border-slate-200/50 bg-white/60 dark:bg-[#152033]/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-505 dark:bg-[#1b2a45] dark:text-slate-300">
                        {temp.category}
                      </span>
                      <h3 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">{temp.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopyTemplate(temp, e)}
                        className={`p-1.5 rounded transition cursor-pointer ${
                          copiedId === temp.id
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600'
                        }`}
                        title="نسخ فوري للنص"
                      >
                        {copiedId === temp.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={(e) => handleDeleteTemplate(temp.id, e)}
                        className="p-1.5 rounded text-slate-450 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 transition cursor-pointer"
                        title="حذف القالب"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-350 line-clamp-2 leading-relaxed h-8">
                    {temp.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Interactive Preview & live edit on select */}
          <div className="lg:col-span-5 bg-slate-50/60 dark:bg-[#152033]/80 p-4 rounded-xl border border-slate-200/60 dark:border-white/5 flex flex-col justify-between">
            {editingTemplateId ? (
              <div className="space-y-3 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-605 dark:text-indigo-400">محرر ومعاين القالب المباشر</span>
                    <button
                      onClick={() => {
                        const original = templates.find(t => t.id === editingTemplateId);
                        if (original) setEditingText(original.content);
                      }}
                      className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                    >
                      إعادة تعيين للأصل
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 mt-1 mb-2">تستطيع التعديل والملء هنا قبل النسخ، أو حفظ تعديلاتك نهائياً:</p>
                  
                  <textarea
                    rows={8}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white dark:bg-[#0c1322] dark:text-white dark:border-white/10 outline-none leading-relaxed transition focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  {localSaveSuccess && (
                     <p className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-450 text-center animate-pulse">✓ تم حفظ تعديلات القالب بشكل دائم!</p>
                  )}
                  {previewCopied && (
                     <p className="text-[10.5px] font-bold text-teal-600 dark:text-teal-400 text-center animate-pulse">✓ تم نسخ المحتوى المعدل بنجاح!</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(editingText);
                        setPreviewCopied(true);
                        setTimeout(() => setPreviewCopied(false), 2000);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-750 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{previewCopied ? 'تم النسخ!' : 'نسخ النص النهائي'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateTemplateContent(editingTemplateId)}
                      className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/40 text-indigo-700 text-xs font-bold dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      حفظ دائم
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 text-slate-400">
                <Compass className="h-8 w-8 text-indigo-400/40 mb-3 animate-pulse" />
                <p className="text-[11px] font-medium max-w-[200px] leading-relaxed">اضغط على أي قالب من القائمة لفتحه هنا وتعديل محتواه وملء الأسماء والبيانات قبل إرسالها للعميل.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
