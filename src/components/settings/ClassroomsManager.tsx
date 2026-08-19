"use client";

import React, { useState, useEffect } from "react";
import {
  getClassroomsAndSectionsAction,
  createClassRoomAction,
  deleteClassRoomAction,
  createSectionAction,
  deleteSectionAction,
} from "@/app/actions/classRoomActions";
import { syncSchoolCurriculumAction } from "@/app/actions/settingsActions";
import {
  GraduationCap,
  Plus,
  Trash2,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  School,
  DollarSign,
  BookOpen,
} from "lucide-react";

interface ClassroomsManagerProps {
  schoolType?: string;
  currency?: string;
}

export const ClassroomsManager: React.FC<ClassroomsManagerProps> = ({
  schoolType = "ابتدائية أهلية",
  currency = "د.ع",
}) => {
  const [classRooms, setClassRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Class Form State
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newClassTuition, setNewClassTuition] = useState("");
  const [newClassInitialSection, setNewClassInitialSection] = useState("أ");
  const [isGraduating, setIsGraduating] = useState(false);
  const [submittingClass, setSubmittingClass] = useState(false);

  // New Section State
  const [activeClassForSection, setActiveClassForSection] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [submittingSection, setSubmittingSection] = useState(false);

  // Quick Preset Sync State
  const [syncingPreset, setSyncingPreset] = useState(false);
  const [selectedPresetType, setSelectedPresetType] = useState(schoolType);

  // Messages
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await getClassroomsAndSectionsAction();
      if (res.success && res.classRooms) {
        setClassRooms(res.classRooms);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setFeedback({ type: "error", message: "يرجى كتابة اسم الصف الدراسي (مثال: الأول متوسط)" });
      return;
    }

    setSubmittingClass(true);
    setFeedback(null);
    try {
      const res = await createClassRoomAction({
        name: newClassName.trim(),
        code: newClassCode.trim() || undefined,
        annualTuition: Number(newClassTuition) || 0,
        initialSectionName: newClassInitialSection.trim() || "أ",
        isGraduatingClass: isGraduating,
      });

      if (res.success) {
        setFeedback({ type: "success", message: `تمت إضافة الصف "${newClassName}" بنجاح مع الشعبة (${newClassInitialSection})!` });
        setNewClassName("");
        setNewClassCode("");
        setNewClassTuition("");
        setIsGraduating(false);
        setIsAddClassOpen(false);
        await fetchClasses();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل إضافة الصف" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ غير متوقع" });
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleAddSection = async (classRoomId: string) => {
    if (!newSectionName.trim()) {
      setFeedback({ type: "error", message: "يرجى كتابة حرف أو اسم الشعبة (مثال: ب أو ج)" });
      return;
    }

    setSubmittingSection(true);
    setFeedback(null);
    try {
      const res = await createSectionAction({
        classRoomId,
        name: newSectionName.trim(),
      });

      if (res.success) {
        setFeedback({ type: "success", message: `تمت إضافة الشعبة "${newSectionName}" بنجاح!` });
        setNewSectionName("");
        setActiveClassForSection(null);
        await fetchClasses();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل إضافة الشعبة" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ" });
    } finally {
      setSubmittingSection(false);
    }
  };

  const handleDeleteClass = async (classRoomId: string, className: string) => {
    if (!confirm(`هل أنت متأكد من حذف الصف "${className}" وكافة شعبه؟`)) return;

    try {
      const res = await deleteClassRoomAction(classRoomId);
      if (res.success) {
        setFeedback({ type: "success", message: `تم حذف الصف "${className}" بنجاح.` });
        await fetchClasses();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل حذف الصف" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ أثناء الحذف" });
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (!confirm(`هل أنت متأكد من حذف الشعبة "${sectionName}"؟`)) return;

    try {
      const res = await deleteSectionAction(sectionId);
      if (res.success) {
        setFeedback({ type: "success", message: `تم حذف الشعبة "${sectionName}" بنجاح.` });
        await fetchClasses();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل حذف الشعبة" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ أثناء الحذف" });
    }
  };

  const handleSyncPreset = async () => {
    if (!confirm(`هل تريد تطبيق مناهج وصفوف (${selectedPresetType}) تلقائياً؟ سيتم إنشاء كافة الصفوف والمواد المعتمدة من وزارة التربية.`)) return;

    setSyncingPreset(true);
    setFeedback(null);
    try {
      const res = await syncSchoolCurriculumAction({
        schoolType: selectedPresetType,
        migrateStudents: true,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "تم تطبيق المنهج والصفوف بنجاح!" });
        await fetchClasses();
      } else {
        setFeedback({ type: "error", message: res.error || "فشل تطبيق المنهج" });
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "حدث خطأ أثناء تطبيق المنهج" });
    } finally {
      setSyncingPreset(false);
    }
  };

  return (
    <div className="space-y-6 font-cairo text-right" dir="rtl">
      {/* Header & Quick Action Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                إدارة الصفوف والشعب الدراسية
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                إضافة الصفوف المدرسية وتفريغ الشعب (أ، ب، ج) وتحديد الأقساط السنوية
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsAddClassOpen(!isAddClassOpen)}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صف دراسي جديد</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form: Add New Class Form */}
      {isAddClassOpen && (
        <form
          onSubmit={handleCreateClass}
          className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-scaleUp"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>إضافة صف دراسي جديد للنظام</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Class Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                اسم الصف الدراسي <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: الأول متوسط أو الرابع العلمي"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Annual Tuition */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                القسط السنوي الافتراضي ({currency})
              </label>
              <input
                type="number"
                placeholder="مثال: 1500000"
                value={newClassTuition}
                onChange={(e) => setNewClassTuition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Initial Section */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                اسم أول شعبة تلقائية
              </label>
              <input
                type="text"
                placeholder="مثال: أ أو 1"
                value={newClassInitialSection}
                onChange={(e) => setNewClassInitialSection(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submittingClass}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submittingClass ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>حفظ الصف والشعبة فوراً</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Preset Quick Generator Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-500/20 shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجهيز سريع حسب مناهج وزارة التربية العراقية</span>
          </div>
          <p className="text-xs text-slate-300">
            هل تود توليد كافة الصفوف والمواد المعتمدة دفعة واحدة بنقرة زر؟
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedPresetType}
            onChange={(e) => setSelectedPresetType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="ابتدائية أهلية">المرحلة الابتدائية (الأول إلى السادس)</option>
            <option value="متوسطة أهلية">المرحلة المتوسطة (الأول إلى الثالث)</option>
            <option value="إعدادية أهلية">المرحلة الإعدادية (الرابع إلى السادس)</option>
            <option value="ثانوية أهلية">المرحلة الثانوية المتكاملة (1-6)</option>
            <option value="روضة وحضانة">رياض الأطفال والتمهيدي</option>
          </select>

          <button
            type="button"
            onClick={handleSyncPreset}
            disabled={syncingPreset}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 shrink-0"
          >
            {syncingPreset ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
            <span>تطبيق المنهج</span>
          </button>
        </div>
      </div>

      {/* Classrooms Grid List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs font-bold">جاري تحميل الصفوف والشعب...</span>
        </div>
      ) : classRooms.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <School className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-black text-slate-800">لم يتم تسجيل أي صفوف دراسية بعد</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            اضغط على زر "إضافة صف دراسي جديد" أعلاه أو استخدم ميزة تطبيق المناهج لتجهيز الصفوف فوراً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classRooms.map((c) => {
            const studentCount = c.studentProfiles?.length || 0;
            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Class Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-base font-black text-slate-900">{c.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>القسط: {Number(c.annualTuition || 0).toLocaleString("ar-IQ")} {currency}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <b>{studentCount}</b> طالب
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="حذف الصف الدراسي"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sections List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    الشعب الدراسية المسجلة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.sections?.map((sec: any) => (
                      <div
                        key={sec.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-black border border-slate-200/80 group"
                      >
                        <span>شعبة {sec.name}</span>
                        {c.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id, sec.name)}
                            className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="حذف الشعبة"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add Section Quick Input */}
                    {activeClassForSection === c.id ? (
                      <div className="flex items-center gap-1 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="اسم الشعبة (ب)"
                          value={newSectionName}
                          onChange={(e) => setNewSectionName(e.target.value)}
                          className="w-20 px-2 py-1 text-xs rounded-xl bg-white border border-indigo-400 text-slate-900 focus:outline-none font-bold"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={submittingSection}
                          onClick={() => handleAddSection(c.id)}
                          className="p-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveClassForSection(null);
                            setNewSectionName("");
                          }}
                          className="p-1 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClassForSection(c.id);
                          setNewSectionName("");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>شعبة جديدة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
