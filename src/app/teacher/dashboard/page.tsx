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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>بوابة المعلم الأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">أهلاً بك {session.fullName}</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            لديك اليوم <span className="text-emerald-400 font-bold">{todaySlots.length} حصص تدريسية</span> في جدول المدرسة.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/teacher/attendance"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل الحضور الصباحي</span>
          </Link>
          <Link
            href="/teacher/grades"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>رصد درجات موادي</span>
          </Link>
        </div>
      </div>

      {/* Period 1 Notification Alert */}
      {isPeriod1Today ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">أنت مكلف بالحصة الأولى اليوم</h3>
              <p className="text-xs text-emerald-800">
                صلاحية رصد الحضور الصباحي للصف مفعلة لديك الآن. يرجى تثبيت كشف الحضور قبل الساعة 9:00 ص.
              </p>
            </div>
          </div>
          <Link
            href="/teacher/attendance"
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shrink-0"
          >
            فتح كشف الحضور
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-500" />
          <span>
            لست معلم الحصة الأولى لليوم. تسجيل الحضور الصباحي مخصص لمعلم الحصة 1 تفادياً للازدواجية.
          </span>
        </div>
      )}

      {/* Grid: Today's Schedule & My Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>حصصي المجدولة لليوم</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا توجد حصص مجدولة لك اليوم.</p>
            ) : (
              todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      الحصة 1 (حضور)
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>المواد والصفوف المخصصة لي</span>
          </h3>

          <div className="space-y-2.5">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{a.subject.name}</h4>
                  <span className="text-[11px] text-slate-500">
                    {a.classRoom.name} (شعبة {a.section.name})
                  </span>
                </div>

                <Link
                  href="/teacher/grades"
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 text-xs"
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
