"use client";

import React, { useState, useEffect } from "react";
import { savePhaseGradesAction, togglePhaseLockAction } from "@/app/actions/gradeActions";
import { GradeRepository } from "@/lib/repositories/GradeRepository";
import { StudentRepository } from "@/lib/repositories/StudentRepository";
import { StudentReportCardModal } from "@/components/print/StudentReportCardModal";
import {
  Award,
  Lock,
  Unlock,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Filter,
  MessageSquare,
} from "lucide-react";

interface GradesClientProps {
  classRooms: any[];
  subjects: any[];
  students: any[];
  currency: string;
  tenant?: any;
}

export const GradesClient: React.FC<GradesClientProps> = ({
  classRooms,
  subjects,
  students: initialStudents,
  tenant,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classRooms[0]?.id || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [activePhase, setActivePhase] = useState<
    "month1" | "month2" | "term1Average" | "midYear" | "month3" | "month4" | "term2Average" | "annualAverage" | "finalExam" | "finalGrade"
  >("month1");

  // Keep selected class and subject valid when school stage classes change
  React.useEffect(() => {
    if (classRooms.length > 0 && !classRooms.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(classRooms[0].id);
    }
    if (subjects.length > 0 && !subjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [classRooms, subjects, selectedClassId, selectedSubjectId]);

  const [students, setStudents] = useState<any[]>(initialStudents);
  const [scoresState, setScoresState] = useState<Record<string, number | "">>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedReportStudent, setSelectedReportStudent] = useState<any>(null);
  const [reportInitialPhase, setReportInitialPhase] = useState<string>("FULL");
  const [isWholeClassPrint, setIsWholeClassPrint] = useState(false);

  const phases = [
    { key: "month1", label: "الشهر الأول", isEditable: true, term: "الفصل الأول" },
    { key: "month2", label: "الشهر الثاني", isEditable: true, term: "الفصل الأول" },
    { key: "term1Average", label: "سعي الفصل 1 (محسوب)", isEditable: false, term: "الفصل الأول" },
    { key: "midYear", label: "نصف السنة", isEditable: true, term: "منتصف السنة" },
    { key: "month3", label: "الشهر الثالث", isEditable: true, term: "الفصل الثاني" },
    { key: "month4", label: "الشهر الرابع", isEditable: true, term: "الفصل الثاني" },
    { key: "term2Average", label: "سعي الفصل 2 (محسوب)", isEditable: false, term: "الفصل الثاني" },
    { key: "annualAverage", label: "السعي السنوي (محسوب)", isEditable: false, term: "السنوي" },
    { key: "finalExam", label: "الامتحان النهائي", isEditable: true, term: "النهائي" },
    { key: "finalGrade", label: "الدرجة النهائية (محسوبة)", isEditable: false, term: "النهائي" },
  ] as const;

  // Filter students in current class
  const classStudents = students.filter((s) => s.classRoomId === selectedClassId);

  // Sync scores state when phase/subject/class changes
  React.useEffect(() => {
    const map: Record<string, any> = {};
    for (const s of classStudents) {
      const g = s.gradeRecords?.find((gr: any) => gr.subjectId === selectedSubjectId);
      const val = g ? g[activePhase] : "";
      map[s.id] = val !== null && val !== undefined ? val : "";
    }
    setScoresState(map);
    setSaveSuccess(false);
  }, [selectedClassId, selectedSubjectId, activePhase, students]);

  // Load local students if empty on offline mount
  useEffect(() => {
    async function loadLocalStudents() {
      if (!initialStudents || initialStudents.length === 0 || (typeof window !== "undefined" && !navigator.onLine)) {
        const localList = await StudentRepository.getStudents();
        if (localList && localList.length > 0) {
          setStudents(localList);
        }
      }
    }
    loadLocalStudents();
  }, [initialStudents]);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = val === "" ? "" : Math.min(100, Math.max(0, Number(val)));
    setScoresState((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSavePhaseGrades = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const items = classStudents.map((s) => ({
        studentId: s.id,
        score: scoresState[s.id] === "" ? null : Number(scoresState[s.id]),
      }));

      const res = await GradeRepository.savePhaseGrades(
        selectedClassId,
        selectedSubjectId,
        activePhase,
        items
      );

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء حفظ الدرجات");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async (lock: boolean) => {
    if (activePhase.includes("Average") || activePhase === "finalGrade") return;
    try {
      await togglePhaseLockAction({
        classRoomId: selectedClassId,
        subjectId: selectedSubjectId,
        phase: activePhase as any,
        lock,
        notifyWhatsApp: lock,
      });
      alert(lock ? "تم قفل المرحلة وإرسال إشعار النتائج عبر واتساب لأولياء الأمور" : "تم فتح المرحلة للتعديل");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء تغيير حالة القفل");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    // If Shift, Enter, ArrowDown, or Tab (without Shift): move to NEXT student
    if (
      e.key === "Shift" ||
      e.key === "Enter" ||
      e.key === "ArrowDown" ||
      (e.key === "Tab" && !e.shiftKey)
    ) {
      if (e.key === "Enter" || e.key === "Shift" || e.key === "ArrowDown") {
        e.preventDefault();
      }
      const nextInput = document.getElementById(`grade-input-${currentIndex + 1}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
      }
      const prevInput = document.getElementById(`grade-input-${currentIndex - 1}`) as HTMLInputElement | null;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  const currentPhaseConfig = phases.find((p) => p.key === activePhase);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل الدرجات والشهادات المرحلي</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            نظام رصد الدرجات المرحلي المعتمد لوزارة التربية مع إمكانية طباعة نتائج أي شهر محدد لجميع المواد أو الشهادة الكاملة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWholeClassPrint(!isWholeClassPrint)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{isWholeClassPrint ? "العودة للرصد المرحلي" : "معاينة كشف الصف الشامل"}</span>
          </button>
        </div>
      </div>

      {/* Class, Subject & Phase Selector Bar */}
      <div className="card-surface p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">الصف الدراسي</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              {classRooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المادة الدراسية</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phased Exam / Month Selector Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-brand-700 mb-1">
              مرحلة التقييم / الاختبار المراد رصده
            </label>
            <select
              value={activePhase}
              onChange={(e) => setActivePhase(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              {phases.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label} {!p.isEditable ? "(محسوب آلياً)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Phase Tabs Bar for Fast 1-Click Jumping */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-1">المرحلة:</span>
            {phases.map((p) => {
              const isSel = activePhase === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePhase(p.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSel
                      ? "bg-brand-700 text-white border-brand-700"
                      : !p.isEditable
                      ? "bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{p.label}</span>
                  {!p.isEditable && (
                    <span className="text-[9px] bg-brand-100 text-brand-700 px-1 rounded font-bold">
                      آلي
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-1">المادة:</span>
            {subjects.map((s) => {
              const isSel = selectedSubjectId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border ${
                    isSel
                      ? "bg-brand-700 text-white border-brand-700"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Meta Bar & Phase Lock */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              {classStudents.length} طلاب مسجلين
            </span>
            <span className="font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg">
              {currentPhaseConfig?.term}
            </span>
          </div>

          {/* Lock / Unlock Phase Button */}
          {currentPhaseConfig?.isEditable && (
            <button
              onClick={() => handleToggleLock(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold transition-all shadow-sm"
              title="قفل المرحلة وإرسال إشعار النتائج لأولياء الأمور عبر واتساب"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>قفل المرحلة وإشعار واتساب</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ الدرجات وإعادة احتساب المعدلات الفصلية والسنوية تلقائياً.</span>
        </div>
      )}

      {/* Whole Class Master Table View */}
      {isWholeClassPrint ? (
        <div className="card-surface p-6 space-y-4 print-container">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">كشف الدرجات الشامل لجميع المواد</h3>
              <p className="text-xs text-slate-500">
                {classRooms.find((c) => c.id === selectedClassId)?.name} — العام الدراسي 2024-2025
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="no-print px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold"
            >
              طباعة الكشف الكامل
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse border border-slate-300">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="border border-slate-300 p-2 text-right">اسم الطالب</th>
                  <th className="border border-slate-300 p-2">المادة</th>
                  <th className="border border-slate-300 p-2">ش 1</th>
                  <th className="border border-slate-300 p-2">ش 2</th>
                  <th className="border border-slate-300 p-2 bg-slate-100">سعي ف1</th>
                  <th className="border border-slate-300 p-2 bg-blue-100">نصف السنة</th>
                  <th className="border border-slate-300 p-2">ش 3</th>
                  <th className="border border-slate-300 p-2">ش 4</th>
                  <th className="border border-slate-300 p-2 bg-slate-100">سعي ف2</th>
                  <th className="border border-slate-300 p-2 bg-indigo-100">السعي السنوي</th>
                  <th className="border border-slate-300 p-2">النهائي</th>
                  <th className="border border-slate-300 p-2 bg-brand-100">الدرجة النهائية</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => {
                  const g = s.gradeRecords?.find((gr: any) => gr.subjectId === selectedSubjectId);
                  return (
                    <tr key={s.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 font-bold text-slate-800 text-right">
                        {s.user.fullName}
                      </td>
                      <td className="border border-slate-300 p-2">{subjects.find((sub) => sub.id === selectedSubjectId)?.name}</td>
                      <td className="border border-slate-300 p-2">{g?.month1 ?? "-"}</td>
                      <td className="border border-slate-300 p-2">{g?.month2 ?? "-"}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">{g?.term1Average ?? "-"}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-blue-50 text-blue-700">{g?.midYear ?? "-"}</td>
                      <td className="border border-slate-300 p-2">{g?.month3 ?? "-"}</td>
                      <td className="border border-slate-300 p-2">{g?.month4 ?? "-"}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-slate-50">{g?.term2Average ?? "-"}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-indigo-50 text-indigo-700">{g?.annualAverage ?? "-"}</td>
                      <td className="border border-slate-300 p-2">{g?.finalExam ?? "-"}</td>
                      <td className="border border-slate-300 p-2 font-bold bg-brand-50 text-brand-700 text-sm">
                        {g?.finalGrade ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Phase Entry Roster */
        <div className="card-surface overflow-hidden space-y-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800">
                رصد درجات: <span className="text-brand-700 font-bold">{currentPhaseConfig?.label}</span> — مادة (
                {subjects.find((s) => s.id === selectedSubjectId)?.name})
              </span>
              <p className="text-[11px] text-slate-500">
                يمكنك الضغط على <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 font-bold">Shift</kbd> أو <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 font-bold">Enter ↵</kbd> للانتقال التلقائي للطالب التالي.
              </p>
            </div>

            {currentPhaseConfig?.isEditable ? (
              <button
                onClick={handleSavePhaseGrades}
                disabled={saving || classStudents.length === 0}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "جاري الحفظ..." : "حفظ واحتساب الدرجات"}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 font-semibold">
                هذه الخانة محسوبة آلياً من المتوسطات الرسمية
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                <tr>
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">اسم الطالب</th>
                  <th className="p-4">الرقم المدرسي</th>
                  <th className="p-4">الشعبة</th>
                  <th className="p-4 text-center w-36">الدرجة (من 100)</th>
                  <th className="p-4 text-center">طباعة النتائج والشهادة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      لا يوجد طلاب في هذا الصف.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-500 text-center">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900">{s.user.fullName}</td>
                      <td className="p-4 font-mono text-slate-500">{s.studentNumber}</td>
                      <td className="p-4 font-semibold text-slate-700">شعبة ({s.section.name})</td>

                      <td className="p-4 text-center">
                        {currentPhaseConfig?.isEditable ? (
                          <input
                            id={`grade-input-${idx}`}
                            type="number"
                            min="0"
                            max="100"
                            value={scoresState[s.id] ?? ""}
                            onChange={(e) => handleScoreChange(s.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onFocus={(e) => e.target.select()}
                            placeholder="لم ترصد"
                            className="w-24 text-center px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm text-slate-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-colors shadow-sm"
                          />
                        ) : (
                          <span className="font-bold text-base text-slate-400 bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200">
                            {scoresState[s.id] !== "" ? scoresState[s.id] : "لم تكتمل"}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReportStudent(s);
                              setReportInitialPhase(activePhase);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all inline-flex items-center gap-1 border border-brand-100 shadow-sm"
                            title={`طباعة كشف درجات (${currentPhaseConfig?.label}) لكافة المواد`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>نتيجة {currentPhaseConfig?.label}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReportStudent(s);
                              setReportInitialPhase("FULL");
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all inline-flex items-center gap-1 border border-slate-300 shadow-sm"
                            title="عرض وطباعة الشهادة السنوية الشاملة"
                          >
                            <span>الشهادة الكاملة</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Student Report Card Modal with Monthly Selection */}
      <StudentReportCardModal
        isOpen={!!selectedReportStudent}
        onClose={() => setSelectedReportStudent(null)}
        student={selectedReportStudent}
        initialPhase={reportInitialPhase}
        tenant={tenant}
      />
    </div>
  );
};
