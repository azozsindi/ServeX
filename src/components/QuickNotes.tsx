import React, { useState } from 'react';
import { QuickNote } from '../types';
import { NotebookPen, Plus, Trash2, Search, Calendar, ChevronDown, Check } from 'lucide-react';

interface QuickNotesProps {
  notes: QuickNote[];
  onSaveNotes: (notes: QuickNote[]) => void;
}

const NOTE_COLORS: Array<{ id: QuickNote['color']; bg: string; text: string; bgBtn: string }> = [
  { id: 'yellow', bg: 'bg-yellow-50/70 border-yellow-200 dark:bg-yellow-500/5 dark:border-yellow-500/20', text: 'text-amber-700 dark:text-amber-400', bgBtn: 'bg-yellow-400' },
  { id: 'blue', bg: 'bg-blue-50/70 border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', bgBtn: 'bg-blue-400' },
  { id: 'green', bg: 'bg-green-50/70 border-green-200 dark:bg-emerald-500/5 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', bgBtn: 'bg-emerald-400' },
  { id: 'red', bg: 'bg-rose-50/70 border-rose-200 dark:bg-rose-500/5 dark:border-rose-500/20', text: 'text-rose-700 dark:text-rose-400', bgBtn: 'bg-rose-400' },
  { id: 'purple', bg: 'bg-purple-50/70 border-purple-200 dark:bg-purple-500/5 dark:border-purple-500/20', text: 'text-purple-750 dark:text-purple-400', bgBtn: 'bg-purple-400' },
  { id: 'gray', bg: 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-white/5', text: 'text-slate-700 dark:text-slate-300', bgBtn: 'bg-slate-450' },
];

export default function QuickNotes({ notes, onSaveNotes }: QuickNotesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<QuickNote['color']>('yellow');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim() || 'ملاحظة بدون عنوان',
      content: newContent.trim(),
      color: selectedColor,
      updatedAt: new Date().toLocaleDateString('ar-SA'),
    };

    onSaveNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setSelectedColor('yellow');
    setIsFormOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    onSaveNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="quick-notes-widget" className="bg-white/80 dark:bg-immersive-card backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-white/5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white font-sans">الملاحظات السريعة والمستندات</h2>
            <p className="text-xs text-slate-400">حفظ المعطيات المؤقتة، الحسابات وبيانات العملاء للوصول السريع</p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-660 hover:bg-teal-700 text-white bg-teal-600 transition shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>ملاحظة جديدة</span>
        </button>
      </div>

      {/* Note Form */}
      {isFormOpen && (
        <form onSubmit={handleAddNote} className="mb-5 p-4 rounded-xl border border-slate-200/50 bg-slate-50/50 dark:bg-immersive-input-bg dark:border-white/5 space-y-3">
          <div>
            <input
              type="text"
              placeholder="عنوان الملاحظة (مثال: طلب أحمد العتيبي)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs font-bold rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-teal-500 transition"
            />
          </div>
          <div>
            <textarea
              placeholder="اكتب تفاصيل الملاحظة هنا..."
              rows={3}
              value={newContent}
              required
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none dark:border-white/10 dark:bg-[#152033] dark:text-white focus:border-teal-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/40 dark:border-white/5">
            {/* Color selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">اللون المميز:</span>
              <div className="flex gap-1">
                {NOTE_COLORS.map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${col.bgBtn} border-2 hover:scale-110 transition cursor-pointer ${
                      selectedColor === col.id ? 'border-indigo-600 scale-105' : 'border-transparent'
                    }`}
                  >
                    {selectedColor === col.id && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition"
              >
                حفظ
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search and notes grid */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في الملاحظات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3 pr-10 outline-none dark:border-white/10 dark:bg-immersive-input-bg dark:text-white focus:border-teal-500 transition"
          />
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-7 text-slate-400 dark:text-slate-500 text-xs text-right">
            {searchTerm ? 'لم يتم العثور على ملاحظات تطابق بحثك.' : 'قائمة الملاحظات فارغة حالياً.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const colorConfig = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
              const isCopied = copiedId === note.id;
              
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${colorConfig.bg}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={`text-xs font-black leading-tight ${colorConfig.text}`}>
                        {note.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded p-1 transition cursor-pointer"
                        title="حذف الملاحظة"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-700 dark:text-slate-205 whitespace-pre-wrap leading-relaxed break-words">
                      {note.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-300/30 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />
                      {note.updatedAt}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(note.content);
                        setCopiedId(note.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`text-[10px] font-bold transition px-2 py-0.5 rounded cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'text-teal-650 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300'
                      }`}
                    >
                      {isCopied ? 'تم النسخ!' : 'نسخ المحتوى'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
