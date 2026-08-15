import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Award,
  CalendarCheck,
  UserCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "عزل أمني تام Multi-Tenant",
      description: "بيانات معزولة بالكامل على مستوى السيرفر وقاعدة البيانات مع 3 بوابات مستقلة (المدير، المعلم، الطالب).",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "نظام الحضور ومنطق الحصة الأولى",
      description: "حساب آلي من الجدول الدراسي يمنح صلاحية رصد الحضور لمعلم الحصة الأولى فقط مع صمام أمان الإدارة.",
      icon: UserCheck,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "نظام الدرجات المرحلي العراقي",
      description: "مطابق 100% لوزارة التربية العراقية (شهري 1 و 2، سعي فصل 1، نصف السنة، شهري 3 و 4، السعي السنوي، والنهائي).",
      icon: Award,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "حسم الإجازات التلقائي (8:00 صباحاً)",
      description: "مجدول آلي يفحص طلبات الإجازة المقبولة ويرصد حالة الطالب 'مجاز' تلقائياً في كشف الحضور الصباحي.",
      icon: CalendarCheck,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "مركز أتمتة إشعارات واتساب",
      description: "طابور إشعارات ذكي لـ 8 أحداث مدرسية (تفعيل الحساب، الغياب، الإجازات، الوصولات، الأقساط، والنتائج).",
      icon: MessageSquare,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "الأقساط والوصولات والنسخ الاحتياطي",
      description: "وصولات برقم تسلسلي، حساب آلي للمتبقي، ونسخ احتياطي ثنائي (تقني + حزمة PDF شاملة للطوارئ).",
      icon: CreditCard,
      color: "text-indigo-500 bg-indigo-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-cairo">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black text-white">منظومة النخبة الذكية</span>
              <span className="text-xs text-emerald-400 block font-semibold">SaaS لإدارة المدارس الأهلية</span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/50"
          >
            <span>دخول النظام التجريبي</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>نظام SaaS متكامل لإدارة المدارس الأهلية في العراق</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            إدارة مدرسية ذكية، دقيقة، ومبنية على اللوائح الرسمية
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            منظومة سحابية متقدمة تدير شؤون الطلاب، حضور الحصة الأولى الذكي، امتحانات وسعي وزارة التربية،
            التقارير اليومية، وأتمتة واتساب لأولياء الأمور بكل سهولة وموثوقية.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-xl shadow-emerald-950/60 flex items-center gap-2"
            >
              <span>تسجيل الدخول وبدء التجربة</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 hover:border-emerald-500/50 transition-all space-y-4 hover:shadow-xl hover:shadow-slate-950/50 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${f.color} border border-white/5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة — منصة إدارة المدارس الأهلية SaaS © 2024
      </footer>
    </div>
  );
}
