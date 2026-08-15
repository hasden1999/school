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
  MessageSquareHeart,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
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
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400">
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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>بوابة الطالب الإلكترونية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{session.fullName}</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {profile.classRoom.name} — شعبة ({profile.section.name}) | الرقم المدرسي:{" "}
            <span className="font-mono font-bold text-blue-300">{profile.studentNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/grades"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>عرض نتائجي وشهادتي</span>
          </Link>
          <Link
            href="/student/leaves"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>طلب إجازة</span>
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>حالة القسط المدرسي</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {remainingTuition === 0 ? "مسدد بالكامل ✅" : `${Number(remainingTuition).toLocaleString()} د.ع متبقي`}
          </h3>
          <p className="text-[11px] text-slate-400">
            المسدد: {Number(totalPaid).toLocaleString()} من {Number(profile.totalTuition).toLocaleString()} د.ع
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>المستمسكات والملف الورقي</span>
            <FolderLock className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            {missingDocsCount === 0 ? "مكتملة وموثقة (5/5) ✅" : `${missingDocsCount} مستمسكات ناقصة`}
          </h3>
          <p className="text-[11px] text-slate-400">
            {missingDocsCount === 0 ? "ملفك مكتمل لدى شؤون الطلبة" : "يرجى رفع المستمسكات لتجنب تعليق القيد"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>واجبات ودروس اليوم</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{recentReports.length} تقارير معتمدة</h3>
          <p className="text-[11px] text-slate-400">ملخصات الدروس والواجبات المعتمدة من الإدارة</p>
        </div>
      </div>

      {/* Grid: Today's Timetable & Recent Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>جدول حصصي لليوم</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد حصص مسجلة في هذا اليوم.</p>
            ) : (
              todaySlots.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center">
                      {s.periodNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.subject.name}</h4>
                      <span className="text-[10px] text-slate-400">{s.teacher.fullName}</span>
                    </div>
                  </div>

                  {s.periodNumber === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      الحصة 1
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Approved Homework */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>آخر الواجبات والدروس المعتمدة</span>
          </h3>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد واجبات منشورة مؤخراً.</p>
            ) : (
              recentReports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.subject.name}: {r.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 font-bold border border-amber-200">
                      📖 الواجب: {r.homework}
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
