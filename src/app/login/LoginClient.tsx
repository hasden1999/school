"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { loginAction, getSchoolBrandingAction } from "@/app/actions/authActions";
import {
  SCHOOL_INFO,
  DEMO_CREDENTIALS,
  SCHOOL_ACTIVITIES,
  SCHOOL_STATS,
} from "@/data/schoolActivitiesData";
import { ActivitiesGallery } from "@/components/activities/ActivitiesGallery";
import { VideoReelsSection } from "@/components/activities/VideoReelsSection";
import { SchoolRegistrationModal } from "@/components/auth/SchoolRegistrationModal";
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
  Hash,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from "lucide-react";

export const LoginClient: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [schoolCode, setSchoolCode] = useState("al-nukhba");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // School Branding Resolution State
  const [detectedSchool, setDetectedSchool] = useState<{
    name: string;
    code: string;
    logo?: string | null;
    motto?: string | null;
    subscriptionStatus?: string;
  } | null>({
    name: "مدرسة المعالي الأهلية الابتدائية المختلطة",
    code: "al-nukhba",
    motto: "بيئة تعليمية رائدة ومنظومة رقمية متكاملة",
    subscriptionStatus: "TRIAL",
  });
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeWarning, setCodeWarning] = useState<string | null>(null);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Mode: "LOGIN" or "GUEST_ACTIVITIES"
  const [mode, setMode] = useState<"LOGIN" | "GUEST_ACTIVITIES">("LOGIN");

  // Verify school code dynamically
  const verifySchoolCode = useCallback(async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toLowerCase();
    if (!trimmed) {
      setDetectedSchool(null);
      setCodeWarning(null);
      return;
    }

    if (trimmed === "superadmin" || trimmed === "super-platform") {
      setDetectedSchool({
        name: "إدارة المنظومة المركزية (Super Admin)",
        code: "super-platform",
        motto: "لوحة التحكم الفائقة لإدارة كافة المدارس والاشتراكات",
      });
      setCodeWarning(null);
      return;
    }

    setIsVerifyingCode(true);
    setCodeWarning(null);

    try {
      const res = await getSchoolBrandingAction(trimmed);
      if (res.success && res.school) {
        setDetectedSchool(res.school);
        setCodeWarning(null);
      } else {
        setDetectedSchool(null);
        setCodeWarning(res.error || "رمز المدرسة غير مسجل في المنظومة");
      }
    } catch {
      setCodeWarning("تعذر التحقق من رمز المدرسة");
    } finally {
      setIsVerifyingCode(false);
    }
  }, []);

  // Debounced auto-verify
  useEffect(() => {
    const timer = setTimeout(() => {
      if (schoolCode && schoolCode.length >= 3) {
        verifySchoolCode(schoolCode);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [schoolCode, verifySchoolCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);

      if (res?.isExpired && res?.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }

      if (res?.error) {
        setError(res.error);
        if (res?.redirectUrl) {
          setTimeout(() => {
            window.location.href = res.redirectUrl;
          }, 1200);
        }
        setLoading(false);
        return;
      }
      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول");
      }
      setLoading(false);
    }
  };

  const handlePreFill = (code: string, u: string, p: string) => {
    setSchoolCode(code);
    setUsername(u);
    setPassword(p);
    setError(null);
    verifySchoolCode(code);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-cairo flex flex-col justify-between relative overflow-x-hidden">

      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block leading-tight">
                {detectedSchool ? detectedSchool.name : SCHOOL_INFO.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                {detectedSchool?.motto || "البوابة الرقمية الموحدة لمنظومة المدارس"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Direct Register School Link in Header */}
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>تسجيل مدرسة جديدة (14 يوماً مجاناً)</span>
            </Link>

            <button
              type="button"
              onClick={() => setMode(mode === "LOGIN" ? "GUEST_ACTIVITIES" : "LOGIN")}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
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
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
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
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>منظومة إدارة المدارس السحابية والهجينة (SaaS)</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                  بوابة الدخول الموحدة <br />
                  <span className="text-emerald-800">
                    {detectedSchool ? detectedSchool.name : "لكافة كوادر وطلبة المدارس"}
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  منصة مركزية هجينة تعمل محلياً بكامل طاقتها داخل المدرسة بدون إنترنت، وتتزامن تلقائياً مع السحابة لمتابعة الدرجات والغيابات والحسابات لحظياً.
                </p>
              </div>

              {/* Dynamic School Recognition Pill Card */}
              {detectedSchool && (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-right space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>تم التعرف على المدرسة بنجاح:</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-800">
                    {detectedSchool.name}
                  </p>
                  <p className="text-[11px] text-emerald-700/80">
                    رمز المدرسة المعتمد: <span className="font-mono font-bold">{detectedSchool.code}</span>
                  </p>
                </div>
              )}

              {/* Quick Trial School Signup Card */}
              <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      هل أنت مدير مدرسة أهلية ترغب بالانضمام؟
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      احصل على بيئة عمل متكاملة مجاناً لمدة 14 يوماً
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/register"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-300" />
                    <span>تسجيل مدرسة جديدة فوراً (14 يوماً مجاناً)</span>
                  </Link>
                </div>
              </div>

              {/* Quick Demo Credentials Switcher */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block">
                  تجربة الدخول السريع (بيانات تجريبية بنقرة واحدة):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "مدير المدرسة", code: "al-nukhba", user: "admin", pass: "admin" },
                    { label: "معلم", code: "al-nukhba", user: "t.ahmed", pass: "teach123" },
                    { label: "طالب", code: "al-nukhba", user: "stu_1001", pass: "stu123" },
                    { label: "مالك المنصة (Super Admin)", code: "super-platform", user: "superadmin", pass: "super123" },
                  ].map((demo) => (
                    <button
                      key={demo.user}
                      type="button"
                      onClick={() => handlePreFill(demo.code, demo.user, demo.pass)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Login Form Card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="card-elevated p-6 sm:p-9 space-y-5 bg-white border border-slate-200 shadow-md rounded-2xl">

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      تسجيل الدخول للمنظومة
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      أدخل رمز المدرسة واسم المستخدم وكلمة المرور المسندة لحسابك
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                {/* Quick Tab Switcher */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <div className="flex-1 py-2 text-center rounded-lg bg-white text-emerald-900 shadow-2xs border border-slate-200/60">
                    تسجيل الدخول للمدرسة
                  </div>
                  <Link
                    href="/register"
                    className="flex-1 py-2 text-center rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-white/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>تسجيل مدرسة جديدة (14 يوماً مجاناً)</span>
                  </Link>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake text-right">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  {/* Field 1: School Code */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        1. رمز المدرسة (School Code) <span className="text-rose-500">*</span>
                      </label>
                      {isVerifyingCode && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>جاري التحقق...</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="schoolCode"
                        required
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                        onBlur={() => verifySchoolCode(schoolCode)}
                        placeholder="مثال: al-nukhba"
                        className={`w-full pl-4 pr-11 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left ${
                          codeWarning
                            ? "border-amber-400 focus:border-amber-500 ring-1 ring-amber-400/30"
                            : detectedSchool
                            ? "border-emerald-500 focus:border-emerald-600 ring-1 ring-emerald-500/20"
                            : "border-slate-300 focus:border-slate-900"
                        }`}
                        dir="ltr"
                      />
                      <School className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>

                    {codeWarning && (
                      <p className="text-[11px] text-amber-700 font-bold mt-1">
                        ⚠️ {codeWarning}
                      </p>
                    )}
                  </div>

                  {/* Field 2: Username */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      2. اسم المستخدم (Username) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="أدخل اسم المستخدم المسند إليك"
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                        dir="ltr"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Field 3: Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      3. كلمة المرور / الرمز السري <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 rounded-xl bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                        dir="ltr"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-900 p-0.5"
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
                    className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري التحقق وتسجيل الدخول...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>دخول المنظومة الآن</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Mobile Registration Trigger Link */}
                <div className="pt-2 text-center sm:hidden">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>تسجيل مدرسة جديدة وتجربة المنظومة (14 يوماً)</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>تواجه مشكلة في تسجيل الدخول؟</span>
                  <a
                    href={`https://wa.me/${SCHOOL_INFO.whatsapp}?text=${encodeURIComponent("السلام عليكم، نحتاج مساعدة في بيانات تسجيل الدخول للمنظومة")}`}
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

      {/* New School 14-day Trial Modal */}
      <SchoolRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegisteredSuccess={(newCode) => {
          setSchoolCode(newCode);
          setShowRegisterModal(false);
          verifySchoolCode(newCode);
        }}
      />

      {/* Footer Note */}
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 font-medium bg-white">
        <span>{detectedSchool ? detectedSchool.name : SCHOOL_INFO.name} — نظام الإدارة الأكاديمية والتربوية الموحدة (SaaS) © 2024</span>
      </footer>

    </div>
  );
};
