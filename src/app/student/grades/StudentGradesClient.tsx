"use client";

import React, { useState } from "react";
import { StudentReportCardModal } from "@/components/print/StudentReportCardModal";
import {
  Award,
  Printer,
  BookOpen,
  Users,
  Crown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface StudentGradesClientProps {
  student: any;
  classGradesData?: {
    allowed: boolean;
    className?: string;
    classmates?: any[];
    subjects?: any[];
  };
}

export const StudentGradesClient: React.FC<StudentGradesClientProps> = ({
  student,
  classGradesData,
}) => {
  const [activeTab, setActiveTab] = useState<"term1" | "midYear" | "term2" | "annual" | "classRoster">("term1");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const gradeRecords = student?.gradeRecords || [];
  const hasClassGradesPermission = classGradesData?.allowed === true;

  // Process classmates rankings
  const processedClassmates = (classGradesData?.classmates || []).map((mate) => {
    const grades = mate.gradeRecords || [];
    let totalScore = 0;
    let count = 0;

    grades.forEach((g: any) => {
      const mark = g.annualAverage ?? g.term1Average ?? g.month1;
      if (mark !== null && mark !== undefined) {
        totalScore += mark;
        count++;
      }
    });

    const average = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;
    return {
      id: mate.id,
      name: mate.user?.fullName || mate.guardianName || "طالب",
      studentNumber: mate.studentNumber,
      isCurrentStudent: mate.id === student?.id,
      average,
      totalScore,
      gradeRecords: grades,
    };
  }).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-6 text-slate-900 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700">النتائج والشهادات الرسمية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">سجل درجاتي وشهادتي الرسمية</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            النتائج المرحلية الرسمية المعتمدة للفصول والامتحانات والسعي السنوي — مدرسة المعالي الأهلية.
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>عرض وطباعة بطاقة الدرجات الرسمية (PDF)</span>
        </button>
      </div>

      {/* Special Permission Banner if Active */}
      {hasClassGradesPermission && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-white shadow-xs">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                ميزة مفعلة بقرار الإدارة: الاطلاع على شيت درجات وترتيب الصف كاملاً 📊
              </span>
              <span className="text-[11px] text-emerald-800 block">
                تم منحك أو منح صفك ({classGradesData?.className}) صلاحية الاطلاع على لوحة التنافس الأكاديمي لشعبتك.
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("classRoster")}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            فتح لوحة ترتيب الصف 🏆
          </button>
        </div>
      )}

      {/* Phased Tabs + Class Roster Tab */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("term1")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "term1"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          الفصل الأول (ش 1 + ش 2)
        </button>
        <button
          onClick={() => setActiveTab("midYear")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "midYear"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          امتحان نصف السنة
        </button>
        <button
          onClick={() => setActiveTab("term2")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "term2"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          الفصل الثاني (ش 3 + ش 4)
        </button>
        <button
          onClick={() => setActiveTab("annual")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "annual"
              ? "bg-emerald-800 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          السعي السنوي والدرجة النهائية
        </button>

        {hasClassGradesPermission && (
          <button
            onClick={() => setActiveTab("classRoster")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "classRoster"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>لوحة ترتيب وشيت درجات الصف 🏆</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB: CLASS ROSTER & RANKS                                 */}
      {/* ========================================================= */}
      {activeTab === "classRoster" && hasClassGradesPermission && (
        <div className="card-surface p-6 space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <span>لوحة الشرف وتنافس الصف: {classGradesData?.className}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                كشف درجات وترتيب طلاب الشعبة لتعزيز التميز الأكاديمي والشفافية.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
              {processedClassmates.length} طالب مسجل بالشعبة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-enterprise text-xs">
              <thead>
                <tr>
                  <th className="text-center w-14">الترتيب</th>
                  <th className="text-right">اسم الطالب</th>
                  <th className="text-center">الرقم الإحصائي</th>
                  <th className="text-center">المعدل العام</th>
                  <th className="text-center">التقدير الأكاديمي</th>
                  <th className="text-center">حالة الطالب</th>
                </tr>
              </thead>
              <tbody>
                {processedClassmates.map((mate, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr
                      key={mate.id}
                      className={
                        mate.isCurrentStudent
                          ? "bg-emerald-50/80 font-bold border-l-4 border-l-emerald-700"
                          : isTop3
                          ? "bg-amber-50/40"
                          : ""
                      }
                    >
                      <td className="text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-bold shadow-xs">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-bold">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-bold">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-600 font-bold">{rank}</span>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {mate.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {mate.name} {mate.isCurrentStudent && "(أنت)"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="text-center font-mono text-slate-600">
                        {mate.studentNumber}
                      </td>

                      <td className="text-center font-bold text-sm text-emerald-800 font-mono">
                        {mate.average > 0 ? `${mate.average}%` : "—"}
                      </td>

                      <td className="text-center">
                        {mate.average >= 90 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900">
                            امتياز 🌟
                          </span>
                        ) : mate.average >= 80 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900">
                            جيد جداً
                          </span>
                        ) : mate.average >= 70 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900">
                            جيد
                          </span>
                        ) : mate.average >= 50 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                            مقبول
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-500">
                            قيد الرصد
                          </span>
                        )}
                      </td>

                      <td className="text-center">
                        {mate.isCurrentStudent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                            حسابك الحالي
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">زميل صف</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INDIVIDUAL GRADES CARDS MATRIX                            */}
      {/* ========================================================= */}
      {activeTab !== "classRoster" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gradeRecords.map((g: any) => {
            return (
              <div
                key={g.id}
                className="card-surface p-6 space-y-4 hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{g.subject.name}</h3>
                    </div>
                  </div>

                  {/* Tab Specific Content */}
                  {activeTab === "term1" && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الشهر الأول:</span>
                        <span className="font-bold text-slate-900">
                          {g.month1 !== null ? `${g.month1} / 100` : "لم تُرصد بعد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الشهر الثاني:</span>
                        <span className="font-bold text-slate-900">
                          {g.month2 !== null ? `${g.month2} / 100` : "لم تُرصد بعد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-emerald-800">
                        <span>سعي الفصل الأول:</span>
                        <span className="text-sm font-bold">
                          {g.term1Average !== null ? `${g.term1Average}` : "قيد الاحتساب"}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "midYear" && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-800 font-bold">درجة امتحان نصف السنة:</span>
                        <span className="font-bold text-blue-800 text-base">
                          {g.midYear !== null ? `${g.midYear} / 100` : "لم تُرصد بعد"}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "term2" && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الشهر الثالث:</span>
                        <span className="font-bold text-slate-900">
                          {g.month3 !== null ? `${g.month3} / 100` : "لم تُرصد بعد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الشهر الرابع:</span>
                        <span className="font-bold text-slate-900">
                          {g.month4 !== null ? `${g.month4} / 100` : "لم تُرصد بعد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-emerald-800">
                        <span>سعي الفصل الثاني:</span>
                        <span className="text-sm font-bold">
                          {g.term2Average !== null ? `${g.term2Average}` : "قيد الاحتساب"}
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "annual" && (
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-800 font-bold">السعي السنوي المعتمد:</span>
                        <span className="font-bold text-amber-800 text-sm">
                          {g.annualAverage !== null ? `${g.annualAverage}` : "قيد الاحتساب"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-800 font-bold">الامتحان النهائي:</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {g.finalExam !== null ? `${g.finalExam}` : "لم تُرصد بعد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200 text-emerald-900 font-bold">
                        <span>الدرجة النهائية:</span>
                        <span className="text-base text-emerald-800">
                          {g.finalGrade !== null ? `${g.finalGrade} / 100` : "بانتظار النهائي"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Report Card Modal */}
      <StudentReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={student}
      />
    </div>
  );
};
