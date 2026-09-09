"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Phone,
  Lock,
  MapPin,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { registerSchoolAction } from "@/app/actions/authActions";

export const RegisterClient: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    schoolCode: string;
    username: string;
    redirectUrl: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorPhone, setDirectorPhone] = useState("");
  const [province, setProvince] = useState("بغداد");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  // Intelligent transliteration & code generator from Arabic name
  const generateCodeFromName = (name: string) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    let base = "school";
    const trimmed = name.trim();
    if (trimmed) {
      const translits: Record<string, string> = {
        "نخبة": "nukhba",
        "معالي": "maali",
        "فراهيدي": "frahidi",
        "رواد": "ruwad",
        "أوائل": "awaiel",
        "بغداد": "baghdad",
        "أهلية": "priv",
        "أمل": "amal",
        "شمس": "shams",
        "نجاح": "najah",
        "تميز": "tamayuz",
        "إبداع": "ibdaa",
        "فرسان": "fursan",
        "هدى": "huda",
        "نور": "noor",
        "أجيال": "ajyal",
      };
      for (const [ar, en] of Object.entries(translits)) {
        if (trimmed.includes(ar)) {
          base = en;
          break;
        }
      }
    }
    return `${base}-${randomSuffix}`;
  };

  // Auto-generate code when user finishes typing school name if not manually modified
  const handleSchoolNameBlur = () => {
    if (schoolName.trim() && !schoolCode) {
      setSchoolCode(generateCodeFromName(schoolName));
    }
  };

  const handleRegenerateCode = () => {
    setSchoolCode(generateCodeFromName(schoolName));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalCode = (schoolCode || generateCodeFromName(schoolName)).trim().toLowerCase();
      const finalUser = (username || "admin").trim().toLowerCase();

      const formData = new FormData();
      formData.append("schoolName", schoolName.trim());
      formData.append("schoolCode", finalCode);
      formData.append("directorName", directorName.trim());
      formData.append("directorPhone", directorPhone.trim());
      formData.append("province", province);
      formData.append("username", finalUser);
      formData.append("password", password.trim());

      const res = await registerSchoolAction(formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSuccessData({
        schoolCode: res?.schoolCode || finalCode,
        username: finalUser,
        redirectUrl: res?.redirectUrl || "/admin/dashboard",
      });

      // Redirect after 2 seconds to allow copying credentials
      setTimeout(() => {
        window.location.href = res?.redirectUrl || "/admin/dashboard";
      }, 2400);
    } catch (err: any) {
      if (err?.message && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message || "حدث خطأ أثناء إنشاء بيئة مدرستكم، يرجى المحاولة مرة أخرى.");
      }
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successData) return;
    const text = `بيانات الدخول لمنظومة المدرسة:\n🏫 كود المدرسة: ${successData.schoolCode}\n👤 اسم المستخدم: ${successData.username}\n🔑 كلمة المرور: ${password}\n🔗 الرابط: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-cairo flex flex-col justify-between" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight">
                منظومة إدارة المدارس السحابية والهجينة
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                تسجيل ذاتي فوري مع تجربة مجانية لمدة 14 يوماً
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full flex flex-col justify-center">
        {successData ? (
          /* SUCCESS SCREEN */
          <div className="max-w-md mx-auto w-full bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-scaleUp">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 inline-block">
                تم التفعيل الفوري (14 يوماً مجاناً)
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                مبروك! تم تجهيز بيئة مدرستكم بنجاح 🚀
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                تم إنشاء حسابكم وتهيئة الصفوف والمواد المعتمدة. جاري توجيهكم تلقائياً إلى لوحة الإدارة...
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-cairo">بيانات الدخول المعتمدة:</span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-cairo font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "تم النسخ" : "نسخ البيانات"}</span>
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-cairo">رمز المدرسة (School Code):</span>
                <span className="font-bold text-emerald-800">{successData.schoolCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-cairo">اسم المستخدم:</span>
                <span className="font-bold text-slate-800">{successData.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-cairo">كلمة المرور:</span>
                <span className="font-bold text-slate-800">•••••••• (التي حددتها)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={successData.redirectUrl}
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>الانتقال فوراً للوحة التحكم</span>
                <ChevronLeft className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM & HIGHLIGHTS */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Benefits & Guarantees */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>انضم لأكثر من 40 مدرسة أهلية رائدة في العراق</span>
                </span>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  سجّل مدرستك الآن <br />
                  <span className="text-emerald-800">وابدأ التجربة فوراً وبدون أي عوائق</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  لا تحتاج لانتظار موافقة مالك المنصة أو توقيع عقود مسبقة. أدخل بيانات المدرسة وافتح لوحة الإدارة بكامل صلاحياتها خلال أقل من 60 ثانية.
                </p>
              </div>

              {/* 3 Pillars Value Props */}
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/50">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      14 يوماً تجربة مجانية كاملة الميزات
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      وصول كامل لإدارة الطلاب، الدرجات الوزارية، الحسابات والأقساط، وغيابات الكادر والطلبة.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200/50">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      بيئة جاهزة فوراً بالمنهاج العراقي
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      يتم توليد المراحل الدراسية، الشعب، والمواد الرسمية والوثائق المطلوبة تلقائياً وبنقرة زر.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/50">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      حفظ وأمان تام للبيانات بعد انتهاء التجربة
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      بعد انتهاء الأسبوعين يُقفل النظام وتظهر لوحة تواصل مع مالك المنصة لتفعيل النسخة دون أن تُحذف أي معلومة.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Support Guarantee */}
              <div className="p-4 rounded-2xl bg-emerald-900 text-white space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>دعم فني واستشارات مجانية خلال التجربة:</span>
                </div>
                <p className="text-[11px] text-emerald-100 leading-relaxed">
                  فريقنا الهندسي جاهز للإجابة عن أي استفسار وتدريب كوادركم على استخدام المنظومة طوال فترة التجربة.
                </p>
              </div>
            </div>

            {/* Right Col: Registration Form Card */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 shadow-md space-y-5">
                
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      نموذج تسجيل مدرسة جديدة
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      يرجى ملء المعلومات المطلوبة لتجهيز بيئة مدرستكم فورياً
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    تفعيل آلي فوري ⚡
                  </span>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
                    ⚠️ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Field 1: School Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      اسم المدرسة الكامل <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        onBlur={handleSchoolNameBlur}
                        placeholder="مثال: مدرسة المعالي الأهلية للبنين"
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium outline-none transition-all"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Field 2: School Code with Auto Generator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        رمز المدرسة بالإنجليزية (School Code) <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>توليد كود تلقائي</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="مثال: al-maali أو nukhba-2025"
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                        dir="ltr"
                      />
                      <span className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 font-mono text-sm">#</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      يستخدم هذا الرمز لتعريف مدرستكم عند تسجيل الدخول من قبل الكادر والطلبة.
                    </p>
                  </div>

                  {/* Field 3: Director Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        اسم المدير / صاحب المدرسة <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={directorName}
                          onChange={(e) => setDirectorName(e.target.value)}
                          placeholder="أ. أحمد جاسم المحترم"
                          className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none transition-all"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        رقم هاتف / واتساب المدير <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={directorPhone}
                          onChange={(e) => setDirectorPhone(e.target.value)}
                          placeholder="07801234567"
                          className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                          dir="ltr"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Field 4: Province Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      المحافظة <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 text-xs sm:text-sm outline-none transition-all appearance-none cursor-pointer"
                      >
                        {[
                          "بغداد",
                          "النجف الأشرف",
                          "كربلاء المقدسة",
                          "البصرة",
                          "أربيل",
                          "السليمانية",
                          "دهوك",
                          "بابل",
                          "نينوى",
                          "كركوك",
                          "ديالى",
                          "الأنبار",
                          "واسط",
                          "صلاح الدين",
                          "ذي قار",
                          "المثنى",
                          "ميسان",
                          "الديوانية",
                        ].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Field 5: Admin Login Credentials */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      بيانات الدخول لحساب المدير الرئيسي:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          اسم المستخدم للمدير
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="admin"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          كلمة المرور للمدير <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-700"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري تهيئة بيئة مدرستكم وتفعيل التجربة...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>تفعيل بيئة المدرسة وبدء التجربة المجانية (14 يوماً) 🚀</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-500">
                    بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية للمنظومة التعليمية.
                  </p>
                </form>

              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 font-medium bg-white">
        <span>منظومة إدارة المدارس الأهلية المركزية (SaaS) — تفعيل فوري وتجربة مجانية لكافة المدارس © 2025</span>
      </footer>
    </div>
  );
};
