"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CreditCard,
  UserCheck,
  CalendarCheck,
  FileSpreadsheet,
  FolderLock,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Database,
  Settings,
  Printer,
  ChevronLeft,
  Download,
  Plus,
  DollarSign,
  Search,
  Building2,
  ShieldCheck,
  Activity,
  Layers,
  Send,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DashboardClientProps {
  school: any;
  user: any;
  totalStudents: number;
  totalTeachers: number;
  pendingLeaves: number;
  pendingReports: number;
  queuedWhatsApp: number;
  totalCollected: number;
  remainingTuition: number;
  missingDocsCount: number;
  attendanceRate: number;
  todayAttendance: any[];
  recentReceipts: any[];
  recentReports: any[];
  recentLeaves: any[];
}

export const DashboardClient: React.FC<DashboardClientProps> = ({
  school,
  user,
  totalStudents,
  totalTeachers,
  pendingLeaves,
  pendingReports,
  queuedWhatsApp,
  totalCollected,
  remainingTuition,
  missingDocsCount,
  attendanceRate,
  todayAttendance,
  recentReceipts,
  recentReports,
  recentLeaves,
}) => {
  const [activeFeedTab, setActiveFeedTab] = useState<"ATTENDANCE" | "LEAVES" | "REPORTS" | "PAYMENTS">("ATTENDANCE");
  const [guidedMode, setGuidedMode] = useState(false);

  const todayStr = new Date().toLocaleDateString("ar-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currency = school?.currency || "د.ع";

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto font-cairo text-slate-900">

      {/* 1. Hero Executive Command Banner with Guided Mode Toggle */}
      <div className="card-surface p-5 sm:p-7 border border-slate-200 shadow-xs bg-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>لوحة القيادة والمتابعة المركزية</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>

              {/* Guided Mode Switch for Beginners & Elderly Users */}
              <button
                type="button"
                onClick={() => setGuidedMode(!guidedMode)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  guidedMode
                    ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <span>💡 وضع التبسيط والإرشاد الذكي:</span>
                <span className="underline">{guidedMode ? "مفعل (شروحات خطوة بخطوة) ✅" : "مغلق"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {school?.name || "مدرسة المعالي الأهلية الابتدائية المختلطة"}
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/70 shadow-2xs">
                تأسست سنة 2017
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              أهلاً بك <strong className="text-emerald-800 font-bold">{user?.fullName || "مدير المدرسة"}</strong> ({user?.jobTitle || "الإدارة العامة"}) — متابعة العمليات المباشرة ليوم {todayStr}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/students"
              className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل طالب جديد</span>
            </Link>

            <Link
              href="/admin/permissions"
              className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>صلاحيات الموظفين والطلاب</span>
            </Link>

            <Link
              href="/admin/backup"
              className="px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-2 shadow-xs"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>حزمة الطوارئ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Guided Mode Info Box */}
      {guidedMode && (
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>دليل اليوم المدرسي في 3 خطوات بسيطة وسريعة:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block">1. أخذ الحضور الصباحي:</span>
              <p className="text-slate-600">افتح صفحة الحضور واضغط "حاضر للكل" ثم حدد الغائب فقط.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block">2. استلام الأقساط وطباعة السند:</span>
              <p className="text-slate-600">افتح صفحة الأقساط واضغط على الطالب واكتب المبلغ واطبع السند.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block">3. متابعة إشعارات الواتساب:</span>
              <p className="text-slate-600">النظام يرسل تلقائياً إشعارات الحضور والوصولات لأولياء الأمور.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. One-Click Quick Actions Dock (محطة العمليات السريعة) */}
      <div className="card-surface p-5 space-y-3.5 border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200/60">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">محطة العمليات السريعة (اختصارات بنقرة واحدة)</h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            وصول فوري لأهم المهام اليومية المتكررة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action 1: Attendance */}
          <Link
            href="/admin/attendance"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-sky-200/60">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">حضور الصباح</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">الحصة الأولى</span>
          </Link>

          {/* Action 2: Grades */}
          <Link
            href="/admin/grades"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-emerald-200/60">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">رصد الدرجات</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">شهري ونصف سنة</span>
          </Link>

          {/* Action 3: Payments */}
          <Link
            href="/admin/payments"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-amber-200/60">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">قبض مالي</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">إصدار وصل مختوم</span>
          </Link>

          {/* Action 4: Timetable */}
          <Link
            href="/admin/schedule"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-indigo-200/60">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">الجدول الأسبوعي</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">توليد وبديل ذكي</span>
          </Link>

          {/* Action 5: Teachers */}
          <Link
            href="/admin/teachers"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-teal-200/60">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">الكادر التدريسي</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">المعلمون والأنصبة</span>
          </Link>

          {/* Action 6: School Profile & Stamp */}
          <Link
            href="/admin/settings"
            className="flex flex-col items-center text-center p-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-rose-200/60">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">هوية المدرسة</span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">الشعار والختم الرسمي</span>
          </Link>
        </div>
      </div>

      {/* 3. Executive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1 */}
        <div className="card-surface p-4 sm:p-5 space-y-2 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي الطلاب المسجلين</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {totalStudents} <span className="text-xs font-bold text-slate-500">طالب</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">✓ قيد أكاديمي مفعّل ومكتمل</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-surface p-4 sm:p-5 space-y-2 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">نسبة الحضور الصباحي</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/60">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {attendanceRate}%
            </h3>
            <p className="text-[11px] text-blue-700 font-bold mt-1">
              سُجلت لـ {todayAttendance.length} من {totalStudents} طالب
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-surface p-4 sm:p-5 space-y-2 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المقبوضات المالية</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {(totalCollected / 1000000).toFixed(1)} م <span className="text-xs font-bold text-slate-500">{currency}</span>
            </h3>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              المتبقي: {(remainingTuition / 1000000).toFixed(1)} مليون {currency}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-surface p-4 sm:p-5 space-y-2 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الهيئة التدريسية</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {totalTeachers} <span className="text-xs font-bold text-slate-500">معلم وموظف</span>
            </h3>
            <p className="text-[11px] text-purple-700 font-semibold mt-1">✓ توزيع الحصص بنسبة 100%</p>
          </div>
        </div>
      </div>

      {/* 4. Actionable Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/leaves"
          className={`p-4 rounded-xl border transition-all flex items-center justify-between shadow-xs cursor-pointer ${
            pendingLeaves > 0
              ? "bg-amber-50/60 border-amber-200/80 hover:bg-amber-50 text-amber-900"
              : "card-surface text-slate-500 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">طلبات الإجازة المعلقة</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">بحاجة لموافقة واعتماد الإدارة</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white text-amber-800 border border-amber-200 tabular-nums font-bold text-xs shadow-2xs">
            {pendingLeaves} طلبات
          </span>
        </Link>

        <Link
          href="/admin/reports"
          className={`p-4 rounded-xl border transition-all flex items-center justify-between shadow-xs cursor-pointer ${
            pendingReports > 0
              ? "bg-sky-50/60 border-sky-200/80 hover:bg-sky-50 text-sky-900"
              : "card-surface text-slate-500 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">التقارير اليومية قيد المراجعة</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">تقارير المعلمين والواجبات</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white text-sky-800 border border-sky-200 tabular-nums font-bold text-xs shadow-2xs">
            {pendingReports} تقرير
          </span>
        </Link>

        <Link
          href="/admin/students"
          className={`p-4 rounded-xl border transition-all flex items-center justify-between shadow-xs cursor-pointer ${
            missingDocsCount > 0
              ? "bg-red-50/60 border-red-200/80 hover:bg-red-50 text-red-900"
              : "card-surface text-slate-500 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">وثائق الطلاب الناقصة</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">شهادة جنسية، صور، بطاقة سكن</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white text-red-800 border border-red-200 tabular-nums font-bold text-xs shadow-2xs">
            {missingDocsCount} طالب
          </span>
        </Link>
      </div>

      {/* 5. Live Operational Feed Tabs (سجل العمليات المباشر) */}
      <div className="card-surface overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-800" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              سجل العمليات اليومية المباشرة
            </h3>
          </div>

          {/* Feed Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFeedTab("ATTENDANCE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFeedTab === "ATTENDANCE"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              حضور الصباح ({todayAttendance.length})
            </button>

            <button
              onClick={() => setActiveFeedTab("PAYMENTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFeedTab === "PAYMENTS"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              أحدث الوصولات ({recentReceipts.length})
            </button>

            <button
              onClick={() => setActiveFeedTab("REPORTS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFeedTab === "REPORTS"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              تقارير المعلمين ({recentReports.length})
            </button>

            <button
              onClick={() => setActiveFeedTab("LEAVES")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeFeedTab === "LEAVES"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              طلبات الإجازة ({recentLeaves.length})
            </button>
          </div>
        </div>

        {/* Tab Content Tables */}
        <div className="p-4 overflow-x-auto">
          {activeFeedTab === "ATTENDANCE" && (
            todayAttendance.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-500">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">لم يتم رصد حضور اليوم حتى الآن</p>
                <Link href="/admin/attendance" className="text-xs text-emerald-800 font-bold hover:underline inline-block">
                  فتح شاشة رصد الحضور الصباحي ←
                </Link>
              </div>
            ) : (
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الصف / الشعبة</th>
                    <th>الحالة</th>
                    <th>وقت الرصد</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.slice(0, 10).map((att: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-bold text-slate-900">{att.student?.fullName || "طالب"}</td>
                      <td>{att.student?.classRoom?.name || "-"} - {att.student?.section?.name || "-"}</td>
                      <td>
                        <Badge
                          variant={att.status === "PRESENT" ? "success" : att.status === "LATE" ? "warning" : "danger"}
                          size="sm"
                          withDot
                        >
                          {att.status === "PRESENT" ? "حاضر" : att.status === "LATE" ? "متأخر" : "غائب"}
                        </Badge>
                      </td>
                      <td className="tabular-nums text-slate-500">08:15 ص</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeFeedTab === "PAYMENTS" && (
            recentReceipts.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-500">
                <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">لا توجد وصولات مقبوضة مسجلة مؤخراً</p>
                <Link href="/admin/payments" className="text-xs text-emerald-800 font-bold hover:underline inline-block">
                  فتح شاشة سندات القبض والمالية ←
                </Link>
              </div>
            ) : (
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>رقم الوصل</th>
                    <th>الطالب</th>
                    <th>المبلغ المقبوض</th>
                    <th>المستلم</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.slice(0, 10).map((rcpt: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-mono font-bold text-emerald-800 tabular-nums">#{rcpt.receiptNumber || `REC-00${idx+1}`}</td>
                      <td className="font-bold text-slate-900">{rcpt.student?.fullName || "طالب"}</td>
                      <td className="font-mono font-bold text-slate-900 tabular-nums">{Number(rcpt.amount || 0).toLocaleString()} {currency}</td>
                      <td>{rcpt.receivedBy || "المحاسب"}</td>
                      <td className="font-mono text-slate-500 tabular-nums">{new Date(rcpt.createdAt || Date.now()).toLocaleDateString("ar-IQ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {activeFeedTab === "REPORTS" && (
            recentReports.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-500">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">لا توجد تقارير يومية مسجلة</p>
                <Link href="/admin/reports" className="text-xs text-emerald-800 font-bold hover:underline inline-block">
                  فتح شاشة التقارير والواجبات ←
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentReports.slice(0, 5).map((rep: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{rep.subject?.name || "مادة دراسية"}</span>
                        <span className="text-[10px] text-slate-500">({rep.classRoom?.name || "-"})</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{rep.lessonTopic || "مفردات المنهج المشروحة"}</p>
                    </div>
                    <Link href="/admin/reports" className="text-xs text-emerald-800 font-bold hover:underline shrink-0 mr-3">
                      مراجعة واعتماد ←
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}

          {activeFeedTab === "LEAVES" && (
            recentLeaves.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-500">
                <Clock className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">لا توجد طلبات إجازة مسجلة</p>
                <Link href="/admin/leaves" className="text-xs text-emerald-800 font-bold hover:underline inline-block">
                  فتح شاشة متابعة الإجازات ←
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentLeaves.slice(0, 5).map((lv: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{lv.student?.fullName || "طالب"}</span>
                      <span className="text-[11px] text-slate-500">{lv.reason || "إجازة مرضية"}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 tabular-nums">
                      {new Date(lv.startDate || Date.now()).toLocaleDateString("ar-IQ")}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

    </div>
  );
};
