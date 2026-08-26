import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDayKey } from "@/lib/attendanceLogic";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FolderLock,
  Calendar,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      classRoom: true,
      section: true,
      paymentReceipts: true,
      documents: {
        include: { requirement: true },
      },
      gradeRecords: {
        include: { subject: true },
      },
    },
  });

  if (!profile) {
    return (
      <div className="text-center py-16 card-surface text-slate-500">
        الملف الشخصي للطالب غير موجود.
      </div>
    );
  }

  const todayKey = getCurrentDayKey();

  // Fetch today's schedule for this student's class and section
  const todaySlots = await prisma.timetableSlot.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      dayOfWeek: todayKey,
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: { periodNumber: "asc" },
  });

  // Approved daily reports & homework
  const recentReports = await prisma.dailyReport.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      status: "APPROVED",
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const totalPaid = profile.paymentReceipts.reduce((sum, r) => sum + r.amount, 0) + profile.depositAmount;
  const remainingTuition = profile.totalTuition - totalPaid;
  const missingDocsCount = profile.documents.filter((d) => d.status === "MISSING" && d.requirement.isRequired).length;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      {/* Welcome Hero */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
            <GraduationCap className="w-4 h-4" />
            <span>بوابة الطالب الإلكترونية المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{session.fullName}</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {profile.classRoom.name} — شعبة ({profile.section.name}) | الرقم المدرسي:{" "}
            <span className="font-mono font-bold text-brand-700">{profile.studentNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/grades"
            className="px-5 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>عرض نتائجي وشهادتي</span>
          </Link>
          <Link
            href="/student/leaves"
            className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors border border-slate-200 flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4 text-blue-700" />
            <span>طلب إجازة</span>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-surface p-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>حالة القسط المدرسي</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-mono">
            {remainingTuition === 0 ? "مسدد بالكامل" : `${Number(remainingTuition).toLocaleString()} د.ع متبقي`}
          </h3>
          <p className="text-[11px] text-slate-500">
            المسدد: {Number(totalPaid).toLocaleString()} من {Number(profile.totalTuition).toLocaleString()} د.ع
          </p>
        </div>

        <div className="card-surface p-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>المستمسكات والملف الورقي</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {missingDocsCount === 0 ? "مكتملة وموثقة (5/5)" : `${missingDocsCount} مستمسكات ناقصة`}
          </h3>
          <p className="text-[11px] text-slate-500">
            {missingDocsCount === 0 ? "ملفك مكتمل لدى شؤون الطلبة" : "يرجى رفع المستمسكات لتجنب تعليق القيد"}
          </p>
        </div>

        <div className="card-surface p-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>واجبات ودروس اليوم</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{recentReports.length} تقارير معتمدة</h3>
          <p className="text-[11px] text-slate-500">ملخصات الدروس والواجبات المعتمدة من الإدارة</p>
        </div>
      </div>

      {/* Grid: Today's Timetable & Recent Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <span>جدول حصصي لليوم</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد حصص مسجلة في هذا اليوم.</p>
            ) : (
              todaySlots.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold flex items-center justify-center">
                      {s.periodNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.subject.name}</h4>
                      <span className="text-[10px] text-slate-500">{s.teacher.fullName}</span>
                    </div>
                  </div>

                  {s.periodNumber === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold text-[10px] border border-brand-100">
                      الحصة 1
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Approved Homework */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-700" />
            <span>آخر الواجبات والدروس المعتمدة</span>
          </h3>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد واجبات منشورة مؤخراً.</p>
            ) : (
              recentReports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.subject.name}: {r.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">{r.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700 font-bold border border-amber-100">
                      الواجب: {r.homework}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
