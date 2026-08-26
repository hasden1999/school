"use client";

import React, { useState, useEffect } from "react";
import { savePhaseGradesAction } from "@/app/actions/gradeActions";
import {
  Award,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
} from "lucide-react";

interface TeacherGradesClientProps {
  assignments: any[];
  students: any[];
}

export const TeacherGradesClient: React.FC<TeacherGradesClientProps> = ({
  assignments,
  students,
}) => {
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);
  const [activePhase, setActivePhase] = useState<"month1" | "month2" | "midYear" | "month3" | "month4" | "finalExam">("month1");
  const [scoresState, setScoresState] = useState<Record<string, number | "">>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeAssignment = assignments[selectedAssignmentIndex];

  const phases = [
    { key: "month1", label: "الشهر الأول", term: "الفصل الأول" },
    { key: "month2", label: "الشهر الثاني", term: "الفصل الأول" },
    { key: "midYear", label: "امتحان نصف السنة", term: "نصف السنة" },
    { key: "month3", label: "الشهر الثالث", term: "الفصل الثاني" },
    { key: "month4", label: "الشهر الرابع", term: "الفصل الثاني" },
    { key: "finalExam", label: "الامتحان النهائي", term: "النهائي" },
  ] as const;

  // Filter students in this assigned classroom and section
  const classStudents = students.filter(
    (s) =>
      s.classRoomId === activeAssignment?.classRoomId &&
      s.sectionId === activeAssignment?.sectionId
  );

  // Sync scores state
  useEffect(() => {
    if (!activeAssignment) return;
    const map: Record<string, any> = {};
    for (const s of classStudents) {
      const g = s.gradeRecords?.find(
        (gr: any) => gr.subjectId === activeAssignment.subjectId
      );
      const val = g ? g[activePhase] : "";
      map[s.id] = val !== null && val !== undefined ? val : "";
    }
    setScoresState(map);
    setSaveSuccess(false);
  }, [selectedAssignmentIndex, activePhase, students]);

  const handleScoreChange = (studentId: string, val: string) => {
    const num = val === "" ? "" : Math.min(100, Math.max(0, Number(val)));
    setScoresState((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSaveGrades = async () => {
    if (!activeAssignment) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const items = classStudents.map((s) => ({
        studentId: s.id,
        score: scoresState[s.id] === "" ? null : Number(scoresState[s.id]),
      }));

      const res = await savePhaseGradesAction({
        classRoomId: activeAssignment.classRoomId,
        subjectId: activeAssignment.subjectId,
        phase: activePhase,
        grades: items,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        window.location.reload();
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      alert(e.message || "خطأ أثناء حفظ الدرجات");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (
      e.key === "Shift" ||
      e.key === "Enter" ||
      e.key === "ArrowDown" ||
      (e.key === "Tab" && !e.shiftKey)
    ) {
      if (e.key === "Enter" || e.key === "Shift" || e.key === "ArrowDown") {
        e.preventDefault();
      }
      const nextInput = document.getElementById(`teacher-grade-input-${currentIndex + 1}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
      }
      const prevInput = document.getElementById(`teacher-grade-input-${currentIndex - 1}`) as HTMLInputElement | null;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="card-surface text-center py-16 text-slate-500 text-xs">
        لم يتم تعيين أي صفوف أو مواد لك بعد من قبل إدارة المدرسة.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">رصد الدرجات المرحلية</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          إدخال الدرجات الشهرية لصفوفك وموادك المخصصة فقط وفق معايير وزارة التربية.
        </p>
      </div>

      {/* Assignment & Phase Selectors */}
      <div className="card-surface p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المادة والصف المكلف به</label>
            <select
              value={selectedAssignmentIndex}
              onChange={(e) => setSelectedAssignmentIndex(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer"
            >
              {assignments.map((a, i) => (
                <option key={a.id} value={i}>
                  {a.subject.name} — {a.classRoom.name} (شعبة {a.section.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-700 mb-1">
              مرحلة التقييم / الاختبار المراد رصده
            </label>
            <select
              value={activePhase}
              onChange={(e) => setActivePhase(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-lg border border-brand-600 text-xs font-bold bg-brand-50 text-brand-800 outline-none focus:ring-1 focus:ring-brand-600 transition-colors cursor-pointer shadow-sm"
            >
              {phases.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label} ({p.term})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            {classStudents.length} طلاب مسجلين في هذه الشعبة
          </span>
          <span className="font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg">
            {phases.find((p) => p.key === activePhase)?.term}
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-pop animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ الدرجات بنجاح واحتساب السعي تلقائياً.</span>
        </div>
      )}

      {/* Grade Entry Table */}
      <div className="card-surface overflow-hidden space-y-0">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800">
              رصد درجات: <span className="text-brand-700 font-bold">{phases.find((p) => p.key === activePhase)?.label}</span>
            </span>
            <p className="text-[11px] text-slate-500">
              يمكنك الضغط على <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 font-bold">Shift</kbd> أو <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 font-bold">Enter ↵</kbd> للانتقال التلقائي للطالب التالي.
            </p>
          </div>

          <button
            onClick={handleSaveGrades}
            disabled={saving || classStudents.length === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "جاري الحفظ..." : "حفظ واعتماد الدرجات"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">الرقم المدرسي</th>
                <th className="p-4 text-center w-36">الدرجة (من 100)</th>
                <th className="p-4 text-center">السعي الحالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا يوجد طلاب في هذا الصف.
                  </td>
                </tr>
              ) : (
                classStudents.map((s, idx) => {
                  const g = s.gradeRecords?.find(
                    (gr: any) => gr.subjectId === activeAssignment?.subjectId
                  );

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-500 text-center">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900">{s.user.fullName}</td>
                      <td className="p-4 font-mono text-slate-500">{s.studentNumber}</td>

                      <td className="p-4 text-center">
                        <input
                          id={`teacher-grade-input-${idx}`}
                          type="number"
                          min="0"
                          max="100"
                          value={scoresState[s.id] ?? ""}
                          onChange={(e) => handleScoreChange(s.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          onFocus={(e) => e.target.select()}
                          placeholder="لم ترصد"
                          className="w-24 text-center px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors shadow-sm"
                        />
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-xs text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                          سعي ف1: {g?.term1Average ?? "-"} | النهائي: {g?.finalGrade ?? "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
