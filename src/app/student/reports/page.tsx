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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">الواجبات والدروس اليومية</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          التقارير اليومية وملخصات الشرح والواجبات المعتمدة والمنشورة من قبل إدارة المدرسة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد واجبات أو تقارير منشورة حالياً.
          </div>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{r.subject.name}</h3>
                      <span className="text-[11px] text-slate-400">أ. {r.teacher.fullName}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{r.date}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">{r.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{r.content}</p>
                  {r.homework && (
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-950 font-bold border border-amber-200">
                      📖 الواجب المطلوب: {r.homework}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span>✅ معتمد من الإدارة المدرسية</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
