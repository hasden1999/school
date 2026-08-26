"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/authActions";
import {
  SCHOOL_INFO,
  DEMO_CREDENTIALS,
  SCHOOL_ACTIVITIES,
  SCHOOL_STATS,
} from "@/data/schoolActivitiesData";
import { ActivitiesGallery } from "@/components/activities/ActivitiesGallery";
import { VideoReelsSection } from "@/components/activities/VideoReelsSection";
import {
  Building2,
  Lock,
  User,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronLeft,
  School,
  Phone,
} from "lucide-react";

export const LoginClient: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Mode: "LOGIN" or "GUEST_ACTIVITIES"
  const [mode, setMode] = useState<"LOGIN" | "GUEST_ACTIVITIES">("LOGIN");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول");
      }
      setLoading(false);
    }
  };

  const handlePreFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-cairo flex flex-col justify-between relative overflow-x-hidden">

      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block leading-tight">
                {SCHOOL_INFO.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                البوابة الرقمية الموحدة
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === "LOGIN" ? "GUEST_ACTIVITIES" : "LOGIN")}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-2 shadow-xs"
            >
              {mode === "LOGIN" ? (
                <>
                  <Compass className="w-4 h-4 text-emerald-700" />
                  <span>تصفح النشاطات كـ ضيف</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>العودة لنموذج تسجيل الدخول</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span>الرئيسية</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center w-full">
        {mode === "LOGIN" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">

            {/* Left Col: School Highlights Info */}
            <div className="lg:col-span-5 space-y-6 text-right order-2 lg:order-1">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>منظومة الإدارة السحابية المعتمدة (SaaS)</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  مرحباً بكم في <br />
                  <span className="text-emerald-800">
                    بوابة الدخول الموحدة
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  منصة مركزية تجمع بين إدارة المدرسة، الكوادر التدريسية، والطلبة وأولياء الأمور لمتابعة الحضور والدرجات والسعي والوصولات اليومية.
                </p>
              </div>

              {/* Fast Stats */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="card-surface p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">نسبة الاعتماد والجودة</span>
                  <span className="text-xl font-bold text-emerald-700 block tabular-nums">100%</span>
                </div>
                <div className="card-surface p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">تحديثات السعي والدرجات</span>
                  <span className="text-base font-bold text-slate-800 block">لحظية ومباشرة</span>
                </div>
              </div>

              {/* Security & Access Info Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>دخول آمن ومشفّر لجميع الكوادر والطلبة:</span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>جلسات عمل مشفرة وفق معايير الحماية الحديثة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>صلاحيات دقيقة بحسب دور المستخدم المعين</span>
                  </div>
                </div>
              </div>

              {/* Quick Demo Credentials Switcher */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  تجربة الدخول السريع (بيانات تجريبية بنقرة واحدة):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "مدير المدرسة", user: "admin", pass: "admin123" },
                    { label: "معلم", user: "t.ahmed", pass: "teach123" },
                    { label: "طالب", user: "stu_1001", pass: "stu123" },
                    { label: "مالك المنصة", user: "superadmin", pass: "super123" },
                  ].map((demo) => (
                    <button
                      key={demo.user}
                      type="button"
                      onClick={() => handlePreFill(demo.user, demo.pass)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Login Form Card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="card-elevated p-6 sm:p-9 space-y-6 bg-white border border-slate-200 shadow-md">

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      تسجيل الدخول للنظام
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      أدخل اسم المستخدم وكلمة المرور المسندة لحسابك
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      اسم المستخدم (Username)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم المسند إليك"
                        className="w-full pl-4 pr-11 py-3 rounded-lg bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      كلمة المرور / الرمز السري
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 rounded-lg bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-900 p-0.5"
                        title={showPassword ? "إخفاء" : "إظهار"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? "جاري التحقق والدخول..." : "دخول المنظومة الآن"}</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>تواجه مشكلة في تسجيل الدخول؟</span>
                  <a
                    href={`https://wa.me/${SCHOOL_INFO.whatsapp}?text=${encodeURIComponent("السلام عليكم، أحتاج مساعدة في استعادة بيانات دخولي للمنظومة")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline font-bold"
                  >
                    تواصل مع الدعم الفني
                  </a>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* GUEST ACTIVITIES MODE VIEW */
          <div className="space-y-10 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>وضع الزائر والضيف الكريم</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                استعراض أنشطة وفيديوهات المدرسة
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                تصفح فعاليات ومسابقات ومرافق المدرسة دون الحاجة لتسجيل حساب. يمكنك العودة لنموذج الدخول في أي وقت من الأعلى.
              </p>
            </div>

            {/* Gallery Component */}
            <ActivitiesGallery />

            {/* Video Reels Component */}
            <VideoReelsSection />
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 font-medium bg-white">
        <span>{SCHOOL_INFO.name} — نظام الإدارة الأكاديمية والتربوية الموحدة © 2024</span>
      </footer>

    </div>
  );
};
