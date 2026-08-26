import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Calendar, User, Sparkles } from "lucide-react";

export default async function StudentReportsPage() {
  const session = await requireAuth(["STUDENT", "ADMIN"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) return null;

  const reports = await prisma.dailyReport.findMany({
    where: {
      tenantId,
      classRoomId: profile.classRoomId,
      sectionId: profile.sectionId,
      status: "APPROVED", // ONLY APPROVED REPORTS
    },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6 text-slate-900 font-cairo animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-surface p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-100">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-violet-700">الدروس والمتابعة الأكاديمية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">الواجبات والدروس اليومية</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            التقارير اليومية وملخصات الشرح والواجبات المعتمدة والمنشورة من قبل إدارة المدرسة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.length === 0 ? (
          <div className="col-span-2 text-center py-16 card-surface text-slate-500 text-xs font-semibold">
            لا توجد واجبات أو تقارير منشورة حالياً.
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="card-surface p-6 space-y-4 hover:border-violet-200 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{r.subject.name}</h3>
                      <span className="text-[11px] text-slate-500 font-semibold">أ. {r.teacher.fullName}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-500 font-semibold">{r.date}</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">{r.title}</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">{r.content}</p>
                  {r.homework && (
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-700 font-bold border border-amber-100">
                      الواجب المطلوب: {r.homework}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-brand-700 font-bold flex items-center gap-1">
                <span>معتمد ومنشور رسمياً من الإدارة المدرسية</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
