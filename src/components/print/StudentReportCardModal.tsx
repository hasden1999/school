"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import {
  Printer,
  Download,
  Award,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";

interface StudentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  initialPhase?: string;
  tenant?: any;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  initialPhase = "FULL",
  tenant,
}) => {
  const [reportType, setReportType] = useState<"FULL" | "MONTHLY">(
    initialPhase === "FULL" ? "FULL" : "MONTHLY"
  );
  const [selectedPhase, setSelectedPhase] = useState<string>(
    initialPhase === "FULL" ? "month1" : initialPhase
  );
  const [applyDecisionMarks, setApplyDecisionMarks] = useState(true);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const t = tenant || student.tenant;
  const schoolName = t?.name || "مدرسة المعالي الأهلية الابتدائية المختلطة";
  const schoolLogo = t?.logo || null;
  const schoolStamp = t?.stampUrl || null;
  const directorName = t?.directorName || "إدارة مدرسة المعالي الأهلية";
  const activeYear = t?.activeYear || "2024-2025";
  const footerText = t?.printFooterText || "وثيقة رسمية صادرة من إدارة مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017) — أي كشط أو تحبير يعتبر لاغياً";
  const schoolType = t?.schoolType || "مدرسة ابتدائية مختلطة (تأسست سنة 2017)";

  const grades = student.gradeRecords || [];

  const phasesList = [
    { key: "month1", label: "اختبار الشهر الأول (الفصل الأول)", term: "الفصل الدراسي الأول", max: 100, min: 50 },
    { key: "month2", label: "اختبار الشهر الثاني (الفصل الأول)", term: "الفصل الدراسي الأول", max: 100, min: 50 },
    { key: "term1Average", label: "سعي الفصل الدراسي الأول", term: "الفصل الدراسي الأول", max: 100, min: 50 },
    { key: "midYear", label: "امتحان نصف السنة الرسمي", term: "امتحانات منتصف السنة", max: 100, min: 50 },
    { key: "month3", label: "اختبار الشهر الأول (الفصل الثاني)", term: "الفصل الدراسي الثاني", max: 100, min: 50 },
    { key: "month4", label: "اختبار الشهر الثاني (الفصل الثاني)", term: "الفصل الدراسي الثاني", max: 100, min: 50 },
    { key: "term2Average", label: "سعي الفصل الدراسي الثاني", term: "الفصل الدراسي الثاني", max: 100, min: 50 },
    { key: "annualAverage", label: "السعي السنوي العام", term: "السعي السنوي الرسمي", max: 100, min: 50 },
    { key: "finalExam", label: "الامتحان النهائي (الدور الأول)", term: "الامتحانات النهائية", max: 100, min: 50 },
    { key: "finalGrade", label: "النتيجة والدرجة النهائية العامة", term: "النتيجة النهائية", max: 100, min: 50 },
  ];

  const currentPhaseObj = phasesList.find((p) => p.key === selectedPhase) || phasesList[0];

  // Helper for grade appraisal & Iraqi Ministry Descriptors
  const getAppraisal = (score: number | null | undefined) => {
    if (score === null || score === undefined) return { label: "—", color: "text-slate-500", desc: "—" };
    if (score >= 90) return { label: "امتياز", color: "text-emerald-700 font-bold", desc: "ممتاز 🌟" };
    if (score >= 80) return { label: "جيد جداً", color: "text-blue-700 font-bold", desc: "جيد جداً ⭐" };
    if (score >= 70) return { label: "جيد", color: "text-teal-700 font-bold", desc: "جيد 👍" };
    if (score >= 60) return { label: "متوسط", color: "text-amber-700 font-bold", desc: "متوسط 📘" };
    if (score >= 50) return { label: "مقبول", color: "text-indigo-700 font-bold", desc: "مقبول ✔️" };
    return { label: "راسب", color: "text-rose-700 font-bold", desc: "دون المستوى ⚠️" };
  };

  // Monthly stats
  const validScores = grades
    .map((g: any) => g[selectedPhase])
    .filter((v: any) => v !== null && v !== undefined);
  const totalScoreSum = validScores.reduce((a: number, b: number) => a + b, 0);
  const averageScore = validScores.length > 0 ? (totalScoreSum / validScores.length).toFixed(1) : "—";
  const failedCount = grades.filter(
    (g: any) => g[selectedPhase] !== null && g[selectedPhase] !== undefined && g[selectedPhase] < 50
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="بطاقة النتائج والشهادات الرسمية للطالب" maxWidth="4xl">
      <div className="space-y-6">
        {/* Actions & Selector Bar (Hidden during Print) */}
        <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Report Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setReportType("MONTHLY")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  reportType === "MONTHLY"
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>طباعة نتيجة شهر / اختبار محدد</span>
              </button>

              <button
                type="button"
                onClick={() => setReportType("FULL")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  reportType === "FULL"
                    ? "bg-brand-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>الشهادة السنوية الشاملة (جميع الأشهر)</span>
              </button>
            </div>

            {/* Print Action */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>طباعة المستند الرسمي (PDF / ورقي)</span>
            </button>
          </div>

          {/* Month Selector for Monthly Mode */}
          {reportType === "MONTHLY" && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700">اختر الشهر أو الاختبار المطلوب طباعته:</span>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 outline-none shadow-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              >
                {phasesList.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Printable Container */}
        {reportType === "MONTHLY" ? (
          /* ========================================================= */
          /* SINGLE MONTH / SPECIFIC EXAM RESULT PRINT TEMPLATE        */
          /* ========================================================= */
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 print-container shadow-sm space-y-6 font-cairo text-slate-900">
            {/* Ministry / School Header */}
            <div className="border-b-2 border-slate-300 pb-4 text-center space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-right text-xs space-y-0.5">
                  <p className="font-bold text-slate-800">جمهورية العراق</p>
                  <p className="font-bold text-slate-800">وزارة التربية</p>
                  <p className="text-[11px] text-slate-500">المديرية العامة للتعليم الأهلي والأجنبي</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-1 shadow-sm overflow-hidden">
                    {schoolLogo ? (
                      <img src={schoolLogo} alt="شعار المدرسة" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Building2 className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {schoolName}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold">{schoolType}</p>
                </div>

                <div className="text-left text-xs space-y-0.5" dir="ltr">
                  <p className="font-bold text-slate-800">Year: {activeYear}</p>
                  <p className="text-slate-600 font-mono text-[11px]">ID: {student.studentNumber}</p>
                </div>
              </div>

              <div className="pt-3">
                <span className="inline-block px-5 py-1.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-xs sm:text-sm font-bold tracking-wider">
                  كشف درجات: {currentPhaseObj.label}
                </span>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {currentPhaseObj.term} — العام الدراسي {activeYear}
                </p>
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">اسم الطالب الرباعي:</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {student.user?.fullName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الصف والمرحلة:</span>
                <span className="font-bold text-slate-800">{student.classRoom?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الشعبة:</span>
                <span className="font-bold text-slate-800">شعبة ({student.section?.name})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الرقم المدرسي:</span>
                <span className="font-mono font-bold text-slate-800">{student.studentNumber}</span>
              </div>
            </div>

            {/* Monthly Subject Grades Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-slate-100 text-slate-900 font-bold">
                  <tr>
                    <th className="p-3 border-l border-slate-300 w-12 text-center">#</th>
                    <th className="p-3 border-l border-slate-300 text-right">المادة الدراسية</th>
                    <th className="p-3 border-l border-slate-300 w-24">الدرجة العظمى</th>
                    <th className="p-3 border-l border-slate-300 w-24">درجة النجاح</th>
                    <th className="p-3 border-l border-slate-300 w-28 bg-brand-50 text-brand-800">
                      الدرجة المحرزة
                    </th>
                    <th className="p-3 border-l border-slate-300 w-24">التقدير</th>
                    <th className="p-3 w-28">حالة المادة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {grades.length > 0 ? (
                    grades.map((g: any, idx: number) => {
                      const score = g[selectedPhase];
                      const isPassed = score !== null && score !== undefined && score >= 50;
                      const isFailed = score !== null && score !== undefined && score < 50;
                      const app = getAppraisal(score);

                      return (
                        <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-slate-500 border-l border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-bold text-slate-900 text-right border-l border-slate-200">
                            {g.subject?.name}
                          </td>
                          <td className="p-3 font-mono text-slate-500 border-l border-slate-200">100</td>
                          <td className="p-3 font-mono text-slate-500 border-l border-slate-200">50</td>
                          <td
                            className={`p-3 font-bold text-sm font-mono border-l border-slate-200 ${
                              isFailed
                                ? "text-rose-600 bg-rose-50/70"
                                : score !== null && score !== undefined
                                ? "text-brand-800 bg-brand-50/50"
                                : "text-slate-500"
                            }`}
                          >
                            {score !== null && score !== undefined ? score : "—"}
                          </td>
                          <td className={`p-3 border-l border-slate-200 ${app.color}`}>
                            {app.label}
                          </td>
                          <td className="p-3">
                            {isPassed ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-100 text-brand-800 font-bold text-[10px]">
                                ناجح ✓
                              </span>
                            ) : isFailed ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                                راسب ✕
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-slate-500 text-center">
                        لا توجد مواد أو درجات مرصودة لهذا الطالب حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Monthly Summary Statistics Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500">المجموع الكلي:</span>
                <span className="font-bold text-sm text-slate-900 font-mono">
                  {totalScoreSum} / {grades.length * 100}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-50 rounded-lg border border-brand-100">
                <span className="font-bold text-brand-800">المعدل العام للشهر:</span>
                <span className="font-bold text-sm text-brand-800 font-mono">
                  {averageScore}%
                </span>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  failedCount === 0
                    ? "bg-brand-50 border-brand-100 text-brand-800"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <span className="font-bold">النتيجة العامة:</span>
                <span className="font-bold text-xs">
                  {failedCount === 0 && validScores.length > 0
                    ? "ناجح ومؤهل"
                    : failedCount > 0
                    ? `مكمل في (${failedCount}) مواد`
                    : "قيد اكتمال الرصد"}
                </span>
              </div>
            </div>

            {/* Official Signatures & School Stamp */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-slate-300 text-xs text-center items-center">
              <div>
                <p className="font-bold text-slate-800 mb-2">مرشد الصف</p>
                <div className="h-12 flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  التوقيع والملاحظة
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2">معاون شؤون الطلبة</p>
                <div className="h-12 flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  التدقيق والمصادقة
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1">مدير المدرسة والختم</p>
                <p className="font-bold text-slate-900 text-xs">{directorName}</p>
                <div className="h-14 flex items-center justify-center mt-1">
                  {schoolStamp ? (
                    <img src={schoolStamp} alt="الختم الرسمي" className="h-14 object-contain filter drop-shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                      الختم الرسمي
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Official Print Footer Text */}
            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
              {footerText}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* FULL ANNUAL REPORT CARD PRINT TEMPLATE                    */
          /* ========================================================= */
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 print-container shadow-sm space-y-6 font-cairo text-slate-900">
            {/* Header */}
            <div className="border-b-2 border-slate-300 pb-6 text-center space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-right text-xs space-y-1">
                  <p className="font-bold text-slate-900">جمهورية العراق</p>
                  <p className="font-bold text-slate-900">وزارة التربية</p>
                  <p className="text-slate-600">المديرية العامة للتعليم الأهلي والأجنبي</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-1 shadow-md overflow-hidden">
                    {schoolLogo ? (
                      <img src={schoolLogo} alt="شعار المدرسة" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{schoolName}</h2>
                  <p className="text-[11px] text-slate-500 font-bold">{schoolType}</p>
                </div>

                <div className="text-left text-xs space-y-1" dir="ltr">
                  <p className="font-bold text-slate-900">Academic Year: {activeYear}</p>
                  <p className="text-slate-600 font-mono">Student ID: {student.studentNumber}</p>
                </div>
              </div>

              <div className="pt-4">
                <span className="inline-block px-6 py-1.5 rounded-full bg-slate-100 text-slate-900 border border-slate-300 text-sm font-bold tracking-wider">
                  كشف الدرجات والنتائج السنوية الرسمية
                </span>
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">اسم الطالب الرباعي:</span>
                <span className="font-bold text-slate-900 text-sm">{student.user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الصف والمرحلة:</span>
                <span className="font-bold text-slate-800">{student.classRoom?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الشعبة:</span>
                <span className="font-bold text-slate-800">شعبة ({student.section?.name})</span>
              </div>
              <div>
                <span className="text-slate-500 block">الرقم المدرسي:</span>
                <span className="font-mono font-bold text-slate-800">{student.studentNumber}</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-center border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold">
                    <th rowSpan={2} className="border border-slate-300 p-2.5 text-right">
                      المادة الدراسية
                    </th>
                    <th colSpan={3} className="border border-slate-300 p-2 bg-slate-200 text-slate-900">
                      الفصل الأول
                    </th>
                    <th rowSpan={2} className="border border-slate-300 p-2 bg-blue-100 text-blue-900">
                      نصف السنة
                    </th>
                    <th colSpan={3} className="border border-slate-300 p-2 bg-slate-200 text-slate-900">
                      الفصل الثاني
                    </th>
                    <th rowSpan={2} className="border border-slate-300 p-2 bg-indigo-100 text-indigo-900">
                      السعي السنوي
                    </th>
                    <th rowSpan={2} className="border border-slate-300 p-2 bg-slate-200 text-slate-900">
                      الامتحان النهائي
                    </th>
                    <th rowSpan={2} className="border border-slate-300 p-2 bg-brand-100 text-brand-800 text-sm">
                      الدرجة النهائية
                    </th>
                    <th rowSpan={2} className="border border-slate-300 p-2 bg-slate-100 text-slate-800 text-xs">
                      التقدير والملاحظات
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600 font-semibold">
                    <th className="border border-slate-300 p-1.5">شهر 1</th>
                    <th className="border border-slate-300 p-1.5">شهر 2</th>
                    <th className="border border-slate-300 p-1.5 bg-slate-100 font-bold">سعي ف1</th>
                    <th className="border border-slate-300 p-1.5">شهر 3</th>
                    <th className="border border-slate-300 p-1.5">شهر 4</th>
                    <th className="border border-slate-300 p-1.5 bg-slate-100 font-bold">سعي ف2</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g: any) => {
                    const finalScore = g.finalGrade ?? g.annualAverage ?? g.midYear;
                    const appraisal = getAppraisal(finalScore);
                    const isDecision = applyDecisionMarks && finalScore >= 45 && finalScore < 50;
                    return (
                      <tr key={g.id} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                        <td className="border border-slate-300 p-2.5 font-bold text-slate-800 text-right">
                          {g.subject?.name}
                        </td>
                        <td className="border border-slate-300 p-2">{g.month1 ?? "-"}</td>
                        <td className="border border-slate-300 p-2">{g.month2 ?? "-"}</td>
                        <td className="border border-slate-300 p-2 bg-slate-50 font-bold text-slate-900">
                          {g.term1Average ?? "-"}
                        </td>
                        <td className="border border-slate-300 p-2 bg-blue-50/50 font-bold text-blue-900">
                          {g.midYear ?? "-"}
                        </td>
                        <td className="border border-slate-300 p-2">{g.month3 ?? "-"}</td>
                        <td className="border border-slate-300 p-2">{g.month4 ?? "-"}</td>
                        <td className="border border-slate-300 p-2 bg-slate-50 font-bold text-slate-900">
                          {g.term2Average ?? "-"}
                        </td>
                        <td className="border border-slate-300 p-2 bg-indigo-50 font-bold text-indigo-900">
                          {g.annualAverage ?? "-"}
                        </td>
                        <td className="border border-slate-300 p-2">{g.finalExam ?? "-"}</td>
                        <td className="border border-slate-300 p-2 bg-brand-50 font-bold text-brand-800 text-sm">
                          {isDecision ? "50" : (g.finalGrade ?? "-")}
                        </td>
                        <td className="border border-slate-300 p-2 font-bold text-xs">
                          {isDecision ? (
                            <span className="text-amber-700">ناجح بالقرار ⚖️ (+{50 - finalScore})</span>
                          ) : (
                            <span className={appraisal.color}>{appraisal.desc}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures & Stamps */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-300 text-xs text-center items-center">
              <div>
                <p className="font-bold text-slate-700 mb-2">معاون شؤون الطلبة</p>
                <div className="h-14 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                  التدقيق والمصادقة
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-1">مدير المدرسة</p>
                <p className="font-bold text-slate-900 text-xs">{directorName}</p>
                <p className="text-[10px] text-slate-500">التوقيع الرسمي</p>
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-2">ختم المدرسة الرسمي</p>
                <div className="h-14 flex items-center justify-center">
                  {schoolStamp ? (
                    <img src={schoolStamp} alt="الختم الرسمي" className="h-14 object-contain filter drop-shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                      الختم الرسمي
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Official Print Footer Text */}
            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
              {footerText}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
