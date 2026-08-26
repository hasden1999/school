"use client";

import React, { useState, useRef } from "react";
import {
  createDatabaseBackupAction,
  getEmergencyBundleData,
  restoreDatabaseBackupAction,
} from "@/app/actions/backupActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  downloadFile,
  exportToCSV,
  generateOfflineSchoolHTML,
} from "@/lib/exportUtils";
import {
  Database,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  Layers,
  Award,
  CreditCard,
  CalendarDays,
  UserCheck,
  Users,
  CheckCircle2,
  UploadCloud,
  FileUp,
} from "lucide-react";

interface BackupClientProps {
  records: any[];
}

export const BackupClient: React.FC<BackupClientProps> = ({ records: initialRecords }) => {
  const [records, setRecords] = useState<any[]>(initialRecords);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastReport, setLastReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emergency Bundle
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    "STUDENTS" | "GRADES" | "PAYMENTS" | "TIMETABLE" | "TEACHERS" | "ATTENDANCE"
  >("STUDENTS");

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        `⚠️ تحذير أمني هام:\nهل أنت متأكد من استعادة النسخة الاحتياطية من الملف (${file.name})؟\nسيقوم النظام بمطابقة وتحديث كافة السجلات والصفوف والطلاب والمقبوضات.`
      )
    ) {
      e.target.value = "";
      return;
    }

    setRestoring(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        const res = await restoreDatabaseBackupAction(content);
        if (res.success) {
          alert("✓ " + res.message);
          window.location.reload();
        } else {
          alert("❌ " + res.error);
        }
      } catch (err: any) {
        alert("حدث خطأ أثناء قراءة الملف: " + err.message);
      } finally {
        setRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const fetchEmergencyData = async () => {
    if (emergencyData) return emergencyData;
    setLoadingEmergency(true);
    try {
      const data = await getEmergencyBundleData();
      setEmergencyData(data);
      return data;
    } catch (e: any) {
      alert(e.message || "خطأ أثناء جلب حزمة الطوارئ");
      return null;
    } finally {
      setLoadingEmergency(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setCreating(true);
    setLastReport(null);
    try {
      const res = await createDatabaseBackupAction();
      setLastReport(res);
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء النسخ الاحتياطي");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEmergencyBundle = async () => {
    const data = await fetchEmergencyData();
    if (data) {
      setIsEmergencyModalOpen(true);
    }
  };

  // 1. Export Standalone Offline Single-File HTML
  const handleDownloadOfflineHTML = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const htmlContent = generateOfflineSchoolHTML(data);
    const dateStamp = new Date().toISOString().split("T")[0];
    const filename = `emergency_school_system_${data.school?.code || "school"}_${dateStamp}.html`;
    downloadFile(filename, htmlContent, "text/html;charset=utf-8;");

    setDownloadSuccess("تم بنجاح تحميل منظومة الطوارئ الأوفلاين (HTML) — يمكنك فتحها في أي متصفح بدون إنترنت!");
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // 2. Export Raw Full Database JSON
  const handleDownloadFullJSON = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const dateStamp = new Date().toISOString().split("T")[0];
    const filename = `full_database_dump_${data.school?.code || "school"}_${dateStamp}.json`;
    downloadFile(filename, jsonContent, "application/json;charset=utf-8;");

    setDownloadSuccess("تم بنجاح تحميل ملف قاعدة البيانات الكاملة (JSON) المخصص للاسترجاع الفني.");
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // 3. Export CSV: Students Master
  const handleExportStudentsCSV = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const headers = [
      "الرقم المدرسي",
      "اسم الطالب الكامل",
      "اسم المستخدم",
      "الصف",
      "الشعبة",
      "اسم ولي الأمر",
      "هاتف ولي الأمر",
      "العنوان",
      "القسط السنوي",
      "العربون المسدد",
      "المجموع المسدد",
      "المتبقي",
      "حالة التسجيل",
    ];

    const rows = (data.students || []).map((s: any) => {
      const paid =
        (s.paymentReceipts || []).reduce((acc: number, r: any) => acc + r.amount, 0) +
        (s.depositAmount || 0);
      const rem = (s.totalTuition || 0) - paid;
      return [
        s.studentNumber,
        s.user?.fullName,
        s.user?.username,
        s.classRoom?.name,
        s.section?.name,
        s.guardianName,
        s.guardianPhone,
        s.address,
        s.totalTuition,
        s.depositAmount,
        paid,
        rem,
        s.registrationStatus,
      ];
    });

    const dateStamp = new Date().toISOString().split("T")[0];
    exportToCSV(`students_master_${dateStamp}.csv`, headers, rows);
  };

  // 4. Export CSV: Grades Master
  const handleExportGradesCSV = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const headers = [
      "اسم الطالب",
      "الرقم المدرسي",
      "الصف",
      "الشعبة",
      "المادة الدراسية",
      "شهر 1",
      "شهر 2",
      "سعي ف1",
      "نصف السنة",
      "شهر 3",
      "شهر 4",
      "سعي ف2",
      "السعي السنوي",
      "الامتحان النهائي",
      "الدرجة النهائية",
      "العام الدراسي",
    ];

    const rows = (data.gradeRecords || []).map((g: any) => [
      g.student?.user?.fullName,
      g.student?.studentNumber,
      g.student?.classRoom?.name,
      g.student?.section?.name,
      g.subject?.name,
      g.month1,
      g.month2,
      g.term1Average,
      g.midYear,
      g.month3,
      g.month4,
      g.term2Average,
      g.annualAverage,
      g.finalExam,
      g.finalGrade,
      g.academicYear,
    ]);

    const dateStamp = new Date().toISOString().split("T")[0];
    exportToCSV(`grades_master_${dateStamp}.csv`, headers, rows);
  };

  // 5. Export CSV: Financial Receipts
  const handleExportPaymentsCSV = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const headers = [
      "رقم الوصل",
      "اسم الطالب",
      "الرقم المدرسي",
      "الصف والشعبة",
      "تاريخ القبض",
      "المبلغ المقبوض",
      "طريقة الدفع",
      "البيان والملاحظات",
    ];

    const rows = (data.paymentReceipts || []).map((r: any) => [
      r.receiptNumber,
      r.student?.user?.fullName,
      r.student?.studentNumber,
      `${r.student?.classRoom?.name} (${r.student?.section?.name})`,
      r.paymentDate,
      r.amount,
      r.paymentMethod,
      r.notes,
    ]);

    const dateStamp = new Date().toISOString().split("T")[0];
    exportToCSV(`financial_receipts_ledger_${dateStamp}.csv`, headers, rows);
  };

  // 6. Export CSV: Timetable
  const handleExportTimetableCSV = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const headers = [
      "اليوم",
      "رقم الحصة",
      "الصف",
      "الشعبة",
      "المادة الدراسية",
      "اسم المدرس",
    ];

    const rows = (data.timetableSlots || []).map((s: any) => [
      s.dayOfWeek,
      `الحصة ${s.periodNumber}`,
      s.classRoom?.name,
      s.section?.name,
      s.subject?.name,
      s.teacher?.fullName,
    ]);

    const dateStamp = new Date().toISOString().split("T")[0];
    exportToCSV(`weekly_timetable_${dateStamp}.csv`, headers, rows);
  };

  // 7. Export CSV: Teachers Staff
  const handleExportTeachersCSV = async () => {
    const data = await fetchEmergencyData();
    if (!data) return;

    const headers = [
      "اسم المعلم الكامل",
      "اسم المستخدم",
      "رقم الهاتف",
      "المواد والصفوف المسندة",
    ];

    const rows = (data.teachers || []).map((t: any) => {
      const assignments = (t.teacherAssignments || [])
        .map((a: any) => `${a.subject?.name} (${a.classRoom?.name} - ${a.section?.name})`)
        .join(" | ");
      return [t.fullName, t.username, t.phone, assignments];
    });

    const dateStamp = new Date().toISOString().split("T")[0];
    exportToCSV(`teachers_staff_${dateStamp}.csv`, headers, rows);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto text-slate-100 font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-indigo-400">حماية البيانات والأمان الفني</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span>النسخ الاحتياطي وحزمة الطوارئ الشاملة</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            تصدير نسخة كاملة مستقلة من بيانات المدرسة على شكل ملفات (HTML أوفلاين، جداول Excel، وقاعدة بيانات JSON).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-md cursor-pointer">
            {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-amber-300" />}
            <span>{restoring ? "جاري الاستعادة..." : "استعادة نسخة احتياطية (.JSON)"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              disabled={restoring}
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleOpenEmergencyBundle}
            disabled={loadingEmergency}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>فتح كشف الطوارئ الشامل (PDF)</span>
          </button>

          <button
            onClick={handleCreateSnapshot}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-md"
          >
            {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-emerald-400" />}
            <span>إنشاء نقطة استرجاع تقنية</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {lastReport && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          ✅ {lastReport.taskName} — {lastReport.details?.join(" | ")}
        </div>
      )}

      {/* Standalone Offline Files Hub */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>النسخة المستقلة الكاملة القابلة للاستخدام بدون إنترنت:</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              منظومة الطوارئ الأوفلاين الشاملة (Single-File Offline Master System)
            </h2>
            <p className="text-xs text-slate-300">
              ملف HTML مستقل كامل يحتوي كافة بيانات مدرستك، يعمل فوراً على أي حاسبة أو موبايل بنقرة واحدة بدون إنترنت وبدون الحاجة لتشغيل أي سيرفر أو برامج إضافية.
            </p>
          </div>

          <button
            onClick={handleDownloadOfflineHTML}
            disabled={loadingEmergency}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-lg shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>تحميل تطبيق الطوارئ الأوفلاين (.HTML)</span>
          </button>
        </div>

        {/* Individual CSV & JSON Export Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير ملفات جداول Excel / CSV مستقلة لكل قسم على حدة:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Students CSV */}
            <button
              type="button"
              onClick={handleExportStudentsCSV}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                    سجل الطلاب والحسابات
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">students_master.csv</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </button>

            {/* 2. Grades CSV */}
            <button
              type="button"
              onClick={handleExportGradesCSV}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-blue-300 transition-colors">
                    سجل الدرجات والشهادات
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">grades_master.csv</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </button>

            {/* 3. Payments CSV */}
            <button
              type="button"
              onClick={handleExportPaymentsCSV}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                    دفتر الوصولات والمقبوضات
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">financial_receipts.csv</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </button>

            {/* 4. Timetable CSV */}
            <button
              type="button"
              onClick={handleExportTimetableCSV}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                    الجدول الدراسي الأسبوعي
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">weekly_timetable.csv</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            </button>

            {/* 5. Teachers Staff CSV */}
            <button
              type="button"
              onClick={handleExportTeachersCSV}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-rose-300 transition-colors">
                    كادر المعلمين والتخصيصات
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">teachers_staff.csv</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
            </button>

            {/* 6. Raw JSON Dump */}
            <button
              type="button"
              onClick={handleDownloadFullJSON}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-right transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white group-hover:text-indigo-200 transition-colors">
                    قاعدة البيانات الشاملة (JSON)
                  </p>
                  <span className="text-[10px] text-indigo-300 font-mono">full_database_dump.json</span>
                </div>
              </div>
              <Download className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Track Strategy Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Track A */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">الخط (أ): نسخة استرجاع تقنية كاملة</h3>
              <p className="text-[11px] text-slate-500">مجدولة يومياً عبر BullMQ / Cron</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            تفريغ كامل ومشفّر لجميع الجداول وقاعدة البيانات والعلاقات لتسهيل الاسترجاع الفوري عند الحاجة أو الانتقال لسيرفر جديد.
          </p>
          <div className="pt-2 text-[11px] text-indigo-700 font-bold">
            🔒 تشفير تام + عزل على مستوى المدرسة (Tenant Isolation).
          </div>
        </div>

        {/* Track B */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">الخط (ب): حزمة الطوارئ القصوى القابلة للقراءة</h3>
              <p className="text-[11px] text-slate-500">مستقلة 100% عن أي نظام برمجي</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            كشف ورقي/PDF شامل يحتوي بيانات الطلاب كاملة، سجل المقبوضات والأقساط، كشوفات الدرجات لكل الفصول، والكادر التدريسي — لضمان استمرارية المدرسة حتى في أسوأ السيناريوهات.
          </p>
          <div className="pt-2 text-[11px] text-amber-700 font-bold">
            📄 يمكن طباعته ورقياً وحفظه في الأرشيف الحديدي للمدرسة.
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-800">
          سجل النسخ الاحتياطية المسجلة
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4">اسم ملف النسخة</th>
                <th className="p-4">النوع</th>
                <th className="p-4">حجم الملف</th>
                <th className="p-4">تاريخ ووقت الإنشاء</th>
                <th className="p-4 text-center">الحالة والتحميل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا توجد نسخ احتياطية مسجلة بعد. اضغط "إنشاء نقطة استرجاع تقنية" للبدء.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{r.fileName}</td>
                    <td className="p-4">
                      <Badge variant="info">
                        {r.backupType === "DATABASE_JSON" ? "قاعدة بيانات كاملة" : "حزمة PDF"}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{r.fileSize}</td>
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(r.createdAt).toLocaleString("ar-IQ")}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        جاهزة وآمنة
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Master Bundle Modal */}
      {emergencyData && (
        <Modal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
          title="حزمة كشف الطوارئ الشاملة (Emergency Human-Readable Master Archive)"
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Navigation tabs inside modal */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("STUDENTS")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeModalTab === "STUDENTS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🎓 الطلاب ({emergencyData.students?.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("GRADES")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeModalTab === "GRADES" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📊 الدرجات ({emergencyData.gradeRecords?.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("PAYMENTS")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeModalTab === "PAYMENTS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  💳 المقبوضات ({emergencyData.paymentReceipts?.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("TIMETABLE")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeModalTab === "TIMETABLE" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📅 الجدول ({emergencyData.timetableSlots?.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("TEACHERS")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeModalTab === "TEACHERS" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  👨‍🏫 المعلمون ({emergencyData.teachers?.length})
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md shrink-0"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>طباعة الكشف المحدد (PDF)</span>
              </button>
            </div>

            {/* Printable Emergency Document */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 space-y-6 print-container text-xs font-cairo">
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h2 className="text-base font-black text-slate-900">{emergencyData.school?.name}</h2>
                <p className="text-xs font-bold text-slate-700">الكشف الأرشيفي الشامل للطوارئ المدرسية — العام الدراسي {emergencyData.school?.activeYear}</p>
                <p className="text-[10px] text-slate-500 font-mono">تاريخ التوليد: {emergencyData.generatedAt}</p>
              </div>

              {/* 1. Students Tab */}
              {activeModalTab === "STUDENTS" && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    1. سجل الطلاب والبيانات المالية والأقساط
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold">
                          <th className="border border-slate-400 p-1.5">الرقم</th>
                          <th className="border border-slate-400 p-1.5 text-right">اسم الطالب</th>
                          <th className="border border-slate-400 p-1.5">الصف والشعبة</th>
                          <th className="border border-slate-400 p-1.5 text-right">ولي الأمر</th>
                          <th className="border border-slate-400 p-1.5">هاتف التواصل</th>
                          <th className="border border-slate-400 p-1.5">القسط الكلي</th>
                          <th className="border border-slate-400 p-1.5">المسدد</th>
                          <th className="border border-slate-400 p-1.5">المتبقي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyData.students.map((s: any) => {
                          const paid =
                            (s.paymentReceipts || []).reduce((sum: number, r: any) => sum + r.amount, 0) +
                            (s.depositAmount || 0);
                          const rem = (s.totalTuition || 0) - paid;
                          return (
                            <tr key={s.id} className="border-b border-slate-200">
                              <td className="border border-slate-300 p-1 font-mono">{s.studentNumber}</td>
                              <td className="border border-slate-300 p-1 font-bold text-right">{s.user.fullName}</td>
                              <td className="border border-slate-300 p-1">{s.classRoom?.name} ({s.section?.name})</td>
                              <td className="border border-slate-300 p-1 text-right">{s.guardianName}</td>
                              <td className="border border-slate-300 p-1 font-mono" dir="ltr">{s.guardianPhone}</td>
                              <td className="border border-slate-300 p-1">{Number(s.totalTuition || 0).toLocaleString()}</td>
                              <td className="border border-slate-300 p-1 font-bold text-emerald-800">{Number(paid).toLocaleString()}</td>
                              <td className="border border-slate-300 p-1 font-bold text-rose-800">{Number(rem).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. Grades Tab */}
              {activeModalTab === "GRADES" && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    2. سجل الدرجات والتقييمات الأكاديمية الشاملة
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold">
                          <th className="border border-slate-400 p-1 text-right">اسم الطالب</th>
                          <th className="border border-slate-400 p-1">الصف</th>
                          <th className="border border-slate-400 p-1">المادة</th>
                          <th className="border border-slate-400 p-1">ش 1</th>
                          <th className="border border-slate-400 p-1">ش 2</th>
                          <th className="border border-slate-400 p-1">سعي ف1</th>
                          <th className="border border-slate-400 p-1">نصف سنة</th>
                          <th className="border border-slate-400 p-1">ش 3</th>
                          <th className="border border-slate-400 p-1">ش 4</th>
                          <th className="border border-slate-400 p-1">سعي ف2</th>
                          <th className="border border-slate-400 p-1">السعي السنوي</th>
                          <th className="border border-slate-400 p-1">النهائي</th>
                          <th className="border border-slate-400 p-1">الدرجة النهائية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyData.gradeRecords?.map((g: any) => (
                          <tr key={g.id} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-1 font-bold text-right">{g.student?.user?.fullName}</td>
                            <td className="border border-slate-300 p-1">{g.student?.classRoom?.name} ({g.student?.section?.name})</td>
                            <td className="border border-slate-300 p-1 font-semibold">{g.subject?.name}</td>
                            <td className="border border-slate-300 p-1">{g.month1 ?? "-"}</td>
                            <td className="border border-slate-300 p-1">{g.month2 ?? "-"}</td>
                            <td className="border border-slate-300 p-1 font-bold">{g.term1Average ?? "-"}</td>
                            <td className="border border-slate-300 p-1 font-bold bg-blue-50">{g.midYear ?? "-"}</td>
                            <td className="border border-slate-300 p-1">{g.month3 ?? "-"}</td>
                            <td className="border border-slate-300 p-1">{g.month4 ?? "-"}</td>
                            <td className="border border-slate-300 p-1 font-bold">{g.term2Average ?? "-"}</td>
                            <td className="border border-slate-300 p-1 font-black bg-indigo-50">{g.annualAverage ?? "-"}</td>
                            <td className="border border-slate-300 p-1">{g.finalExam ?? "-"}</td>
                            <td className="border border-slate-300 p-1 font-black bg-emerald-50 text-emerald-900">{g.finalGrade ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Payments Tab */}
              {activeModalTab === "PAYMENTS" && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    3. دفتر المقبوضات والوصولات المالية
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold">
                          <th className="border border-slate-400 p-1.5">رقم الوصل</th>
                          <th className="border border-slate-400 p-1.5 text-right">اسم الطالب</th>
                          <th className="border border-slate-400 p-1.5">الصف والشعبة</th>
                          <th className="border border-slate-400 p-1.5">تاريخ القبض</th>
                          <th className="border border-slate-400 p-1.5">المبلغ المقبوض</th>
                          <th className="border border-slate-400 p-1.5">طريقة الدفع</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyData.paymentReceipts?.map((r: any) => (
                          <tr key={r.id} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-1 font-mono font-bold">{r.receiptNumber}</td>
                            <td className="border border-slate-300 p-1 font-bold text-right">{r.student?.user?.fullName}</td>
                            <td className="border border-slate-300 p-1">{r.student?.classRoom?.name} ({r.student?.section?.name})</td>
                            <td className="border border-slate-300 p-1 font-mono">{r.paymentDate}</td>
                            <td className="border border-slate-300 p-1 font-black text-emerald-800">{Number(r.amount).toLocaleString()}</td>
                            <td className="border border-slate-300 p-1">{r.paymentMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Timetable Tab */}
              {activeModalTab === "TIMETABLE" && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    4. الجدول الدراسي الأسبوعي المجمع
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold">
                          <th className="border border-slate-400 p-1.5">اليوم</th>
                          <th className="border border-slate-400 p-1.5">الحصة</th>
                          <th className="border border-slate-400 p-1.5">الصف والشعبة</th>
                          <th className="border border-slate-400 p-1.5">المادة</th>
                          <th className="border border-slate-400 p-1.5">المدرس</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyData.timetableSlots?.map((slot: any) => (
                          <tr key={slot.id} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-1 font-bold">{slot.dayOfWeek}</td>
                            <td className="border border-slate-300 p-1 font-mono">{slot.periodNumber}</td>
                            <td className="border border-slate-300 p-1">{slot.classRoom?.name} ({slot.section?.name})</td>
                            <td className="border border-slate-300 p-1 font-bold">{slot.subject?.name}</td>
                            <td className="border border-slate-300 p-1">{slot.teacher?.fullName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Teachers Tab */}
              {activeModalTab === "TEACHERS" && (
                <div className="space-y-2">
                  <h3 className="font-black text-sm bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                    5. الكادر التدريسي وتوزيع المواد
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    {emergencyData.teachers.map((t: any) => (
                      <div key={t.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <span className="font-black text-slate-900 block text-xs">{t.fullName}</span>
                        <span className="text-slate-500 font-mono text-[11px] block" dir="ltr">
                          {t.phone || "—"}
                        </span>
                        <div className="pt-1 text-[10px] text-slate-600">
                          المواد:{" "}
                          {(t.teacherAssignments || [])
                            .map((a: any) => `${a.subject?.name} (${a.classRoom?.name} - ${a.section?.name})`)
                            .join("، ") || "لم تسند مواد"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
