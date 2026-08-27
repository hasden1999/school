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
  ChevronLeft,
  Plus,
} from "lucide-react";

export const revalidate = 0;

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
    <div className="space-y-6 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      
      {/* 1. Cheerful Welcome Hero */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-l from-slate-900 via-emerald-950 to-emerald-900 text-white rounded-3xl shadow-md border-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
              🏫 مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/30">
              بوابة الكادر التعليمي
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            أهلاً بك يا أستاذ، {session.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            لديك اليوم <strong className="text-white font-bold tabular-nums">{todaySlots.length} حصص تدريسية</strong> في جدول الدوام المدرسي.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/teacher/attendance"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل حضور الصباح 📋</span>
          </Link>
          <Link
            href="/teacher/grades"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>رصد درجات موادي</span>
          </Link>
        </div>
      </div>

      {/* 2. Fast 1-Click Operations Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: Morning Attendance */}
        <Link
          href="/teacher/attendance"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold border border-sky-200 group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
              تسجيل الحضور الصباحي
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              أخذ غياب الحصة الأولى بضغطة زر واحدة وإرسال إشعار فوري لولي الأمر.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-sky-700 gap-1 pt-1">
            <span>فتح كشف الحضور</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>

        {/* Action 2: Grades Entry */}
        <Link
          href="/teacher/grades"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
              رصد الدرجات والشيت
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              تسجيل درجات الشهور ونصف السنة والامتحانات للصفوف المكلف بها.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-700 gap-1 pt-1">
            <span>فتح شيت الدرجات</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>

        {/* Action 3: Daily Homework & Reports */}
        <Link
          href="/teacher/reports"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold border border-purple-200 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
              دفتر اليومية والواجبات
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              كتابة واجبات اليوم ومادة الدرس لتظهر فوراً في بوابات أولياء الأمور.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-700 gap-1 pt-1">
            <span>كتابة تقرير اليوم</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>

        {/* Action 4: Timetable */}
        <div className="card-surface p-5 space-y-3 border border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              جدول حصصي لليوم
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              لديك اليوم {todaySlots.length} حصص مجدولة حسب الجدول الأسبوعي.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-800 gap-1 pt-1">
            <span>موضح بالأسفل ⬇️</span>
          </div>
        </div>
      </div>

      {/* 3. Period 1 Duty Banner */}
      {isPeriod1Today ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">أنت مكلف بالحصة الأولى اليوم</h3>
              <p className="text-xs text-slate-600 font-medium">
                صلاحية رصد الحضور الصباحي للصف مفعلة لديك الآن. يرجى تثبيت كشف الحضور بنقرة واحدة.
              </p>
            </div>
          </div>
          <Link
            href="/teacher/attendance"
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            فتح كشف الحضور ←
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-3 font-medium shadow-xs">
          <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          <span>
            لست معلم الحصة الأولى لليوم. تسجيل الحضور الصباحي مخصص لمعلم الحصة 1 تفادياً للازدواجية.
          </span>
        </div>
      )}

      {/* 4. Grid: Today's Schedule & My Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-700" />
            <span>حصصي المجدولة لليوم ({todaySlots.length} حصص)</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد حصص مجدولة لك اليوم.</p>
            ) : (
              todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      {slot.periodNumber}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{slot.subject.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {slot.classRoom.name} — شعبة ({slot.section.name})
                      </span>
                    </div>
                  </div>

                  {slot.periodNumber === 1 && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
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
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <span>المواد والصفوف المخصصة لي</span>
          </h3>

          <div className="space-y-2.5">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-white transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{a.subject.name}</h4>
                  <span className="text-[11px] text-slate-500">
                    {a.classRoom.name} (شعبة {a.section.name})
                  </span>
                </div>

                <Link
                  href="/teacher/grades"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100 text-xs transition-colors cursor-pointer"
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
