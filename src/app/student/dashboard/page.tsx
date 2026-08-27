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
  Sparkles,
  Crown,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";

export const revalidate = 0;

export default async function StudentDashboardPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      classRoom: true,
      section: true,
      paymentReceipts: true,
      tenant: true,
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
      <div className="text-center py-16 card-surface text-slate-500 font-cairo">
        الملف الشخصي للطالب غير موجود.
      </div>
    );
  }

  // Parse student overrides (Class representative or View Full Class grades)
  let isClassRep = false;
  let canViewClassGrades = false;
  if (profile.user?.permissionsJson) {
    try {
      const parsed = JSON.parse(profile.user.permissionsJson);
      isClassRep = !!parsed.isClassRepresentative;
      canViewClassGrades = !!parsed.allowViewClassGrades;
    } catch {}
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
  const schoolPhone = profile.tenant?.phone || "07700000000";

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 max-w-7xl mx-auto font-cairo">
      
      {/* 1. Cheerful Institutional Welcome Hero */}
      <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl shadow-md border-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold backdrop-blur-md">
              🏫 مدرسة المعالي الأهلية الابتدائية المختلطة (تأسست 2017)
            </span>
            {isClassRep && (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center gap-1 shadow-xs">
                <Crown className="w-3.5 h-3.5" />
                <span>كابتن وممثل الشعبة 👑</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            أهلاً بك يا بطل، {session.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            الصف: <strong className="text-white font-bold">{profile.classRoom.name}</strong> — الشعبة: <strong className="text-white font-bold">({profile.section.name})</strong> | الرقم الإحصائي: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{profile.studentNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/student/grades"
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            <Award className="w-4 h-4" />
            <span>شهاداتي ونتائجي 🏆</span>
          </Link>
          <Link
            href="/student/leaves"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-200" />
            <span>طلب إجازة مرضية</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Giant, High-Clarity Action Cards (للصغار والكبار بدون تدريب) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Grades & Report Card */}
        <Link
          href="/student/grades"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
              درجاتي وشهادتي الرسمية
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              استعرض درجات الشهور ونصف السنة والدرجة النهائية، ولوحة تنافس الصف.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-700 gap-1 pt-1">
            <span>فتح السجل</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 2: Tuition & Payments */}
        <Link
          href="/student/payments"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-slate-200 bg-white cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800">
              حساباتي والأقساط
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              المسدد: {Number(totalPaid).toLocaleString()} د.ع | المتبقي: {Number(remainingTuition).toLocaleString()} د.ع
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-700 gap-1 pt-1">
            <span>عرض تفاصيل الأقساط</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 3: Daily Timetable */}
        <div className="card-surface p-5 space-y-3 border border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              حصص ودروس اليوم
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              لديك اليوم {todaySlots.length} حصص مسجلة في جدول الدوام.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-700 gap-1 pt-1">
            <span>موضح بالأسفل ⬇️</span>
          </div>
        </div>

        {/* Card 4: WhatsApp Support */}
        <a
          href={`https://wa.me/${schoolPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            `السلام عليكم إدارة مدرسة المعالي، أنا ولي أمر الطالب/ة (${session.fullName}) من الصف (${profile.classRoom.name} - ${profile.section.name}). لدي استفسار:`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="card-surface p-5 space-y-3 hover:border-emerald-600 hover:shadow-md transition-all group border border-emerald-200 bg-emerald-50/40 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              تحدث مع الإدارة عبر الواتساب
            </h3>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              تواصل مباشر مع إدارة المدرسة للاستفسارات والطلبات بدون مراجعة حضورية.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-800 gap-1 pt-1">
            <span>إرسال رسالة فورية</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* 3. Daily Classes and Homework Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <span>جدول الحصص الدراسية اليوم ({todaySlots.length} حصص)</span>
          </h3>

          <div className="space-y-2.5">
            {todaySlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد حصص مسجلة في هذا اليوم (عطلة أو يوم حر).</p>
            ) : (
              todaySlots.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center shadow-2xs">
                      {s.periodNumber}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.subject.name}</h4>
                      <span className="text-[11px] text-slate-500">الأستاذ: {s.teacher.fullName}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                    الحصة {s.periodNumber}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Approved Homework */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-700" />
            <span>الواجبات والدروس اليومية المطلوبة</span>
          </h3>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد واجبات جديدة منشورة اليوم.</p>
            ) : (
              recentReports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{r.subject.name}: {r.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">{r.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-900 font-bold border border-amber-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>الواجب البيتي: {r.homework}</span>
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
