"use client";

import React, { useState } from "react";
import {
  setPlannedClosureDateAction,
  toggleStudentClearanceAction,
  executeAcademicYearClosureAction,
} from "@/app/actions/academicYearActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  CreditCard,
  FileCheck,
  RefreshCw,
  FolderLock,
  HelpCircle,
  Sparkles,
  Search,
} from "lucide-react";

interface AcademicYearClientProps {
  auditData: any;
}

export const AcademicYearClient: React.FC<AcademicYearClientProps> = ({ auditData }) => {
  const [plannedDate, setPlannedDate] = useState(auditData.plannedClosureDate);
  const [savingDate, setSavingDate] = useState(false);

  // Closure Execution Modal
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [closedYear, setClosedYear] = useState(auditData.activeYear);
  const [newYear, setNewYear] = useState("2025-2026");
  const [closureDate, setClosureDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [confirmText, setConfirmText] = useState("");
  const [executing, setExecuting] = useState(false);
  const [closureResult, setClosureResult] = useState<any>(null);

  // Clearance search
  const [debtSearch, setDebtSearch] = useState("");

  const handleSavePlannedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDate(true);
    try {
      await setPlannedClosureDateAction(plannedDate);
      alert("تم حفظ تاريخ إغلاق العام الدراسي بنجاح.");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ");
    } finally {
      setSavingDate(false);
    }
  };

  const handleToggleClearance = async (studentId: string, currentVal: boolean) => {
    try {
      await toggleStudentClearanceAction(studentId, !currentVal);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ في تعديل براءة الذمة");
    }
  };

  const handleExecuteClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "إغلاق العام الدراسي") {
      alert("يرجى كتابة عبارة التأكيد المطلوبة للمتابعة.");
      return;
    }

    setExecuting(true);
    try {
      const res = await executeAcademicYearClosureAction({
        closedYear,
        newYear,
        closureDate,
      });

      if (res.error) {
        alert(res.error);
      } else {
        setClosureResult(res);
        setIsClosureModalOpen(false);
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ أثناء تنفيذ إغلاق العام");
    } finally {
      setExecuting(false);
    }
  };

  const filteredDebtStudents = (auditData.studentsWithDebt || []).filter(
    (s: any) =>
      s.fullName.includes(debtSearch) ||
      s.studentNumber.includes(debtSearch) ||
      s.className.includes(debtSearch)
  );

  return (
    <div className="space-y-8 animate-fadeIn font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-100">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>العام الدراسي الحالي: {auditData.activeYear}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            إغلاق العام الدراسي والترقية التلقائية والأرشيف
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            فحص الذمم والمتعلقات، ترقية الطلاب للصفوف التالية، وأرشفة خريجي المراحل المنتهية.
          </p>
        </div>

        <button
          onClick={() => setIsClosureModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-md"
        >
          <Lock className="w-4 h-4" />
          <span>بدء إجراءات إغلاق العام الدراسي والترقية</span>
        </button>
      </div>

      {/* Closure Success Banner */}
      {closureResult && (
        <div className="p-6 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">
                تم إغلاق العام الدراسي بنجاح وفتح العام الجديد ({newYear})!
              </h3>
              <p className="text-xs text-brand-700">
                تمت ترقية {closureResult.promotedCount} طالب إلى الصفوف التالية، وأرشفة{" "}
                {closureResult.graduatedCount} طالب في قسم الخريجين.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planned Date Setting Card */}
      <div className="card-surface p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-600" />
            <span>تاريخ الإغلاق المخطط للعام الدراسي</span>
          </h3>
          <p className="text-xs text-slate-500">
            تحديد الموعد النهائي لحسم كافة السجلات المالية والدرجات واستكمال براءة الذمة.
          </p>
        </div>

        <form onSubmit={handleSavePlannedDate} className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            required
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
          />
          <button
            type="submit"
            disabled={savingDate}
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-xs shrink-0"
          >
            {savingDate ? "جاري الحفظ..." : "تثبيت الموعد"}
          </button>
        </form>
      </div>

      {/* Pre-Closure Clearance & Readiness Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="card-surface p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>الطلاب المقيدون</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{auditData.totalActiveStudents} طالب</h3>
          <p className="text-[11px] text-slate-500">مشمولون بالترقية أو التخرج</p>
        </div>

        <div className="card-surface p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي الذمم والأقساط غير المسددة</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="text-xl font-bold text-rose-600">
            {Number(auditData.totalSchoolDebt).toLocaleString()} {auditData.currency}
          </h3>
          <p className="text-[11px] text-slate-500">
            {auditData.studentsWithDebt.length} طالب بذمتهم متبقي
          </p>
        </div>

        <div className="card-surface p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>الدرجات غير المرصودة</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {auditData.studentsWithIncompleteGrades.length} طالب
          </h3>
          <p className="text-[11px] text-slate-500">بانتظار رصد وقفل النهائي</p>
        </div>

        <div className="card-surface p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>جاهزية الإغلاق والترقية</span>
            <ShieldCheck className="w-4 h-4 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-brand-700">
            {auditData.isReadyForClosure ? "مكتمل 100%" : "يتطلب حسم الذمم"}
          </h3>
          <p className="text-[11px] text-slate-500">فحص براءة الذمة</p>
        </div>
      </div>

      {/* Pre-Closure Debt & Clearance Ledger */}
      <div className="card-surface overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-600" />
              <span>كشف براءة الذمة المالية للطلاب قبل الإغلاق</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              قائمة الطلاب الذين بذمتهم أقساط متبقية. يمكن منح استثناء/براءة ذمة مؤقتة لترحيل الطالب.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={debtSearch}
              onChange={(e) => setDebtSearch(e.target.value)}
              placeholder="بحث في ذمم الطلاب..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>
        </div>

        {filteredDebtStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-bold">
            لا توجد أي ذمم مالية معلقة! جميع الطلاب مسددون أو حاصلون على براءة ذمة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">الطالب</th>
                  <th className="p-3.5">الصف</th>
                  <th className="p-3.5">القسط الكلي</th>
                  <th className="p-3.5">المسدد</th>
                  <th className="p-3.5">المتبقي بذمته</th>
                  <th className="p-3.5 text-center">إجراء براءة الذمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDebtStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <span>{s.fullName}</span>
                      <span className="block font-mono text-[10px] text-slate-500">
                        {s.studentNumber} | {s.guardianPhone}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">{s.className}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {Number(s.totalTuition).toLocaleString()} {auditData.currency}
                    </td>
                    <td className="p-3.5 font-bold text-brand-700">
                      {Number(s.totalPaid).toLocaleString()} {auditData.currency}
                    </td>
                    <td className="p-3.5 font-bold text-rose-600">
                      {Number(s.remaining).toLocaleString()} {auditData.currency}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleClearance(s.id, s.isCleared)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          s.isCleared
                            ? "bg-brand-50 text-brand-700 border border-brand-100"
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {s.isCleared ? "تمت براءة الذمة ✓" : "منح براءة ذمة وترحيل"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Progression Matrix (خطة انتقال وترقية الصفوف) */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600" />
          <span>مسار الترقية التلقائية والتخرج للصفوف الدراسية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {auditData.classRooms.map((c: any, idx: number) => {
            const isLast = idx === auditData.classRooms.length - 1;
            const next = auditData.classRooms[idx + 1];

            return (
              <div
                key={c.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  <Badge variant={isLast ? "success" : "info"}>
                    {isLast ? "مرحلة منتهية" : "مرحلة انتقالية"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-200">
                  <span>ينتقل إلى:</span>
                  <span className="font-bold text-brand-700">
                    {isLast ? "أرشيف الخريجين الدائم" : next?.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Closures */}
      {auditData.pastClosures.length > 0 && (
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">سجل إغلاق الأعوام السابقة</h3>
          <div className="divide-y divide-slate-100">
            {auditData.pastClosures.map((cl: any) => (
              <div key={cl.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    العام المغلق: {cl.closedYear} ← العام الجديد: {cl.newYear}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    تاريخ الإغلاق: {cl.closureDate}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-brand-700 font-bold bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                    ترقية: {cl.promotedCount} طالب
                  </span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    تخرج: {cl.graduatedCount} طالب
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year Closure Execution Modal */}
      <Modal
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        title="تأكيد إغلاق العام الدراسي وفتح العام الجديد"
        maxWidth="lg"
      >
        <form onSubmit={handleExecuteClosure} className="space-y-4 font-cairo text-slate-900">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>إجراء إداري هام وحاسم:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-slate-600">
              <li>سيتم تثبيت وتجميد كافة درجات ووصولات العام ({closedYear}).</li>
              <li>سيتم ترقية جميع طلاب الصفوف غير المنتهية إلى الصف التالي تلقائياً.</li>
              <li>سيتم نقل طلاب المرحلة المنتهية (السادس الإعدادي) إلى قسم وأرشيف الخريجين.</li>
              <li>سيتم أخذ لقطة نسخة احتياطية تقنية كاملة قبل التبديل.</li>
              <li>سيتحول النظام فوراً للعمل على العام الدراسي الجديد ({newYear}).</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">العام المغلق *</label>
              <input
                type="text"
                disabled
                value={closedYear}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">العام الدراسي الجديد *</label>
              <input
                type="text"
                required
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2025-2026"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-bold font-mono outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">تاريخ الإغلاق الفعلي *</label>
            <input
              type="date"
              required
              value={closureDate}
              onChange={(e) => setClosureDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-600">
              للتأكيد، اكتب في الحقل أدناه عبارة:{" "}
              <span className="text-rose-700 font-bold">إغلاق العام الدراسي</span>
            </label>
            <input
              type="text"
              required
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="إغلاق العام الدراسي"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-rose-300 text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsClosureModalOpen(false)}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={executing || confirmText !== "إغلاق العام الدراسي"}
              className="px-6 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              {executing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{executing ? "جاري الترقية والإغلاق..." : "تأكيد الإغلاق والترقية الفورية"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
