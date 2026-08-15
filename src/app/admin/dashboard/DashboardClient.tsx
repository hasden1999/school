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

  const todayStr = new Date().toLocaleDateString("ar-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currency = school?.currency || "د.ع";

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto font-cairo">
      {/* 1. Hero Executive Command Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة القيادة المدرسية المتكاملة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {school?.name || "المدرسة الأهلية"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              أهلاً بك <strong className="text-emerald-400">{user?.fullName}</strong> — متابعة العمليات والتقارير المباشرة ليوم {todayStr}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/students"
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل طالب جديد</span>
            </Link>

            <Link
              href="/admin/grades"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-2 backdrop-blur-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>سجل الدرجات</span>
            </Link>

            <Link
              href="/admin/backup"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition-all border border-indigo-400/30 flex items-center gap-2 backdrop-blur-sm"
            >
              <Database className="w-4 h-4 text-indigo-300" />
              <span>حزمة الطوارئ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. One-Click Quick Actions Dock (محطة العمليات السريعة لتسهيل عمل النظام) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-900">محطة العمليات السريعة (اختصارات بنقرة واحدة)</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
            وصول فوري لأهم المهام اليومية المتكررة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action 1: Attendance */}
          <Link
            href="/admin/attendance"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-blue-900">حضور الصباح</span>
            <span className="text-[10px] text-slate-500 mt-0.5">الحصة الأولى</span>
          </Link>

          {/* Action 2: Grades */}
          <Link
            href="/admin/grades"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-emerald-900">رصد الدرجات</span>
            <span className="text-[10px] text-slate-500 mt-0.5">تنقل سلس بمفتاح Tab</span>
          </Link>

          {/* Action 3: Payments */}
          <Link
            href="/admin/payments"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-amber-900">قبض مالي</span>
            <span className="text-[10px] text-slate-500 mt-0.5">إصدار وصل مختوم</span>
          </Link>

          {/* Action 4: Timetable */}
          <Link
            href="/admin/schedule"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200/80 hover:border-purple-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-purple-900">الجدول الدراسي</span>
            <span className="text-[10px] text-slate-500 mt-0.5">توليد وطباعة A4</span>
          </Link>

          {/* Action 5: Emergency Bundle */}
          <Link
            href="/admin/backup"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-indigo-900">حزمة الطوارئ</span>
            <span className="text-[10px] text-slate-500 mt-0.5">نسخة أوفلاين كاملة</span>
          </Link>

          {/* Action 6: School Profile & Stamp */}
          <Link
            href="/admin/settings"
            className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/80 border border-slate-200/80 hover:border-rose-300 transition-all group shadow-sm"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-800 group-hover:text-rose-900">هوية المدرسة</span>
            <span className="text-[10px] text-slate-500 mt-0.5">الشعار والختم الرسمي</span>
          </Link>
        </div>
      </div>

      {/* 3. Executive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلاب المسجلين</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{totalStudents} <span className="text-xs font-bold text-slate-400">طالب</span></h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ قيد أكاديمي مفعّل ومكتمل</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة الحضور الصباحي</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{attendanceRate}%</h3>
            <p className="text-[11px] text-blue-600 font-bold mt-1">سُجلت لـ {todayAttendance.length} من {totalStudents} طالب</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المقبوضات المالية</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{(totalCollected / 1000000).toFixed(1)} م <span className="text-xs font-bold text-slate-400">{currency}</span></h3>
            <p className="text-[11px] text-amber-600 font-bold mt-1">المتبقي: {(remainingTuition / 1000000).toFixed(1)} مليون</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الكادر التدريسي</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{totalTeachers} <span className="text-xs font-bold text-slate-400">مدرس</span></h3>
            <p className="text-[11px] text-purple-600 font-bold mt-1">✓ جداول وأنصبة الحصص مكتملة</p>
          </div>
        </div>
      </div>

      {/* 4. Action Queues & Daily Operational Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Items Column */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>مهام تتطلب تدقيق الإدارة</span>
          </h3>

          <div className="space-y-3">
            <Link
              href="/admin/leaves"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">طلبات إجازة معلّقة</h4>
                  <p className="text-[10px] text-slate-500">حسم آلي الساعة 8:00 صباحاً</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-xs shadow-sm">
                {pendingLeaves}
              </span>
            </Link>

            <Link
              href="/admin/reports"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">تقارير وواجبات بانتظار الاعتماد</h4>
                  <p className="text-[10px] text-slate-500">مرفوعة من المعلمين للتدقيق</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-xs shadow-sm">
                {pendingReports}
              </span>
            </Link>

            <Link
              href="/admin/students"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FolderLock className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">طلاب بمستمسكات ناقصة</h4>
                  <p className="text-[10px] text-slate-500">إرسال تذكير واتساب جماعي</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-sm">
                {missingDocsCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Interactive Feed / Today's Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>موجز نشاط العمليات المباشر</span>
            </h3>

            {/* Feed Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFeedTab("ATTENDANCE")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFeedTab === "ATTENDANCE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                الحضور الصباحي
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("PAYMENTS")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFeedTab === "PAYMENTS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                المقبوضات الأخيرة
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("REPORTS")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFeedTab === "REPORTS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                التقارير اليومية
              </button>
            </div>
          </div>

          {/* Feed Tab 1: Attendance */}
          {activeFeedTab === "ATTENDANCE" && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {todayAttendance.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  لم يتم تسجيل حضور الصباح اليوم بعد. اضغط "حضور الصباح" لرصد الحضور.
                </div>
              ) : (
                todayAttendance.slice(0, 10).map((att: any) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        att.status === "PRESENT" ? "bg-emerald-500" : att.status === "ABSENT" ? "bg-rose-500" : "bg-amber-500"
                      }`} />
                      <div>
                        <span className="font-bold text-slate-900">{att.student?.user?.fullName || "طالب"}</span>
                        <span className="text-[10px] text-slate-500 block">
                          {att.student?.classRoom?.name} ({att.student?.section?.name})
                        </span>
                      </div>
                    </div>
                    <Badge variant={att.status === "PRESENT" ? "success" : att.status === "ABSENT" ? "danger" : "warning"}>
                      {att.status === "PRESENT" ? "حاضر" : att.status === "ABSENT" ? "غائب" : "إجازة معتمدة"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Feed Tab 2: Payments */}
          {activeFeedTab === "PAYMENTS" && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentReceipts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  لا توجد مقبوضات مالية مسجلة مؤخراً.
                </div>
              ) : (
                recentReceipts.map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{r.student?.user?.fullName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">وصل #{r.receiptNumber} — {r.paymentDate}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-emerald-800 text-sm block">
                        {Number(r.amount).toLocaleString()} {currency}
                      </span>
                      <span className="text-[10px] text-slate-400">{r.paymentMethod}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Feed Tab 3: Reports */}
          {activeFeedTab === "REPORTS" && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentReports.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  لا توجد تقارير يومية مرفوعة اليوم.
                </div>
              ) : (
                recentReports.map((rep: any) => (
                  <div
                    key={rep.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{rep.subject?.name} — {rep.classRoom?.name}</span>
                      <span className="text-[10px] text-slate-500">المعلم: {rep.teacher?.fullName}</span>
                    </div>
                    <Badge variant={rep.status === "APPROVED" ? "success" : "warning"}>
                      {rep.status === "APPROVED" ? "معتمد" : "بانتظار الموافقة"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
