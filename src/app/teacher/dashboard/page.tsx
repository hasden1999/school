import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentDayKey } from "@/lib/attendanceLogic";
import Link from "next/link";
import {
  BookOpen,
  UserCheck,
  Award,
  FileSpreadsheet,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default async function TeacherDashboardPage() {
  const session = await requireAuth(["TEACHER", "ADMIN"]);
  const tenantId = session.tenantId;

  const todayKey = getCurrentDayKey();

  // Fetch teacher's assigned subjects & classes
  const [assignments, todaySlots, reports] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { tenantId, teacherId: session.id },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
    }),
    prisma.timetableSlot.findMany({
      where: { tenantId, teacherId: session.id, dayOfWeek: todayKey },
      include: {
        classRoom: true,
        section: true,
        subject: true,
      },
      orderBy: { periodNumber: "asc" },
    }),
    prisma.dailyReport.findMany({
      where: { tenantId, teacherId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const isPeriod1Today = todaySlots.some((s) => s.periodNumber === 1);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      {/* Welcome Banner */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
            <GraduationCap className="w-4 h-4" />
            <span>بوابة المعلم الأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">أهلاً بك {session.fullName}</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            لديك اليوم <span className="text-brand-700 font-bold tabular-nums">{todaySlots.length} حصص تدريسية</span> في جدول المدرسة.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/teacher/attendance"
            className="px-5 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل الحضور الصباحي</span>
          </Link>
          <Link
            href="/teacher/grades"
            className="px-5 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors border border-slate-300 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>رصد درجات موادي</span>
          </Link>
        </div>
      </div>

      {/* Period 1 Notification Alert */}
      {isPeriod1Today ? (
        <div className="p-5 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">أنت مكلف بالحصة الأولى اليوم</h3>
              <p className="text-xs text-slate-600 font-medium">
                صلاحية رصد الحضور الصباحي للصف مفعلة لديك الآن. يرجى تثبيت كشف الحضور قبل الساعة 9:00 ص.
              </p>
            </div>
          </div>
          <Link
            href="/teacher/attendance"
            className="px-5 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            فتح كشف الحضور ←
          </Link>
        </div>
      ) : (
        <div className="p-4.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-3 font-medium shadow-xs">
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          <span>
            لست معلم الحصة الأولى لليوم. تسجيل الحضور الصباحي مخصص لمعلم الحصة 1 تفادياً للازدواجية.
          </span>
        </div>
      )}

      {/* Grid: Today's Schedule & My Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>حصصي المجدولة لليوم</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد حصص مجدولة لك اليوم.</p>
            ) : (
              todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {slot.periodNumber}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{slot.subject.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {slot.classRoom.name} — شعبة ({slot.section.name})
                      </span>
                    </div>
                  </div>

                  {slot.periodNumber === 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-100">
                      الحصة 1 (حضور)
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-700" />
            <span>المواد والصفوف المخصصة لي</span>
          </h3>

          <div className="space-y-2.5">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{a.subject.name}</h4>
                  <span className="text-[11px] text-slate-500">
                    {a.classRoom.name} (شعبة {a.section.name})
                  </span>
                </div>

                <Link
                  href="/teacher/grades"
                  className="px-3.5 py-1.5 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 font-bold hover:bg-brand-100 text-xs transition-colors cursor-pointer"
                >
                  رصد الدرجات
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
