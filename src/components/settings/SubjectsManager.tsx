"use client";

import React, { useState, useEffect } from "react";
import {
  getSchoolSubjectsAction,
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
} from "@/app/actions/subjectActions";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
} from "lucide-react";

export const SubjectsManager: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSchoolSubjectsAction();
      if (res.success && res.subjects) {
        setSubjects(res.subjects);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await createSubjectAction({
        name: name.trim(),
        code: code.trim() || undefined,
        orderIndex: Number(orderIndex) || subjects.length + 1,
      });

      if (res.success) {
        setFeedback({ type: "success", message: `تمت إضافة مادة "${name}" بنجاح!` });
        setName("");
        setCode("");
        setIsAddOpen(false);
        await fetchSubjects();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل إضافة المادة" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ غير متوقع" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editName.trim()) return;

    setUpdating(true);
    setFeedback(null);
    try {
      const res = await updateSubjectAction(editingSubject.id, {
        name: editName.trim(),
        orderIndex: Number(editOrder),
      });

      if (res.success) {
        setFeedback({ type: "success", message: `تم تعديل المادة بنجاح!` });
        setEditingSubject(null);
        await fetchSubjects();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل التعديل" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string, subjectName: string) => {
    if (!confirm(`هل أنت متأكد من حذف مادة "${subjectName}"؟`)) return;

    try {
      const res = await deleteSubjectAction(id);
      if (res.success) {
        setFeedback({ type: "success", message: `تم حذف مادة "${subjectName}" بنجاح.` });
        await fetchSubjects();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل الحذف" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ" });
    }
  };

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              دليل المواد والمناهج الدراسية
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة وتعديل المواد المعتمدة، ترتيب ظهورها في الشهادات وكشوف الدرجات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="px-5 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة دراسية جديدة</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-4 rounded-lg border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-brand-50 border-brand-100 text-brand-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add Form */}
      {isAddOpen && (
        <form
          onSubmit={handleCreate}
          className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-card space-y-4 animate-scaleUp"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-brand-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة مادة دراسية جديدة</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">
                اسم المادة الدراسية <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: الرياضيات، التربية الإسلامية"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">
                رمز المادة بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: MATH, ISLAMIC"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-medium font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ المادة فوراً</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {editingSubject && (
        <form
          onSubmit={handleUpdate}
          className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-card space-y-4 animate-scaleUp"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              <span>تعديل بيانات مادة ({editingSubject.name})</span>
            </h4>
            <button
              type="button"
              onClick={() => setEditingSubject(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">اسم المادة</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-600">الترتيب في الشهادة</label>
              <input
                type="number"
                value={editOrder}
                onChange={(e) => setEditOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors font-medium font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subjects Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs font-bold">جاري تحميل المواد الدراسية...</span>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">لا توجد مواد مسجلة حالياً</h4>
          <p className="text-xs text-slate-500">
            اضغط على "إضافة مادة دراسية جديدة" أو استخدم ميزة تطبيق المنهج لتوليد المواد تلقائياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((sub, idx) => (
            <div
              key={sub.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-pop transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-100 shrink-0 font-mono">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{sub.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{sub.code}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(sub);
                    setEditName(sub.name);
                    setEditOrder(sub.orderIndex || idx + 1);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="تعديل المادة"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="حذف المادة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
