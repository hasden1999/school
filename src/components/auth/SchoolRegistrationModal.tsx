"use client";

import React, { useState } from "react";
import {
  Building2,
  User,
  Phone,
  Lock,
  MapPin,
  Sparkles,
  X,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { registerSchoolAction } from "@/app/actions/authActions";

interface SchoolRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisteredSuccess?: (schoolCode: string) => void;
}

export const SchoolRegistrationModal: React.FC<SchoolRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisteredSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorPhone, setDirectorPhone] = useState("");
  const [province, setProvince] = useState("بغداد");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  // Auto-suggest English school code from school name or random
  const handleGenerateCode = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    let base = "school";
    if (schoolName.trim()) {
      const translits: Record<string, string> = {
        "نخبة": "nukhba",
        "معالي": "maali",
        "فراهيدي": "frahidi",
        "رواد": "ruwad",
        "أوائل": "awaiel",
        "بغداد": "baghdad",
        "أهلية": "priv",
      };
      for (const [ar, en] of Object.entries(translits)) {
        if (schoolName.includes(ar)) {
          base = en;
          break;
        }
      }
    }
    setSchoolCode(`${base}-${randomSuffix}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("schoolName", schoolName.trim());
      formData.append("schoolCode", (schoolCode || "school-" + Math.floor(1000 + Math.random() * 9000)).trim().toLowerCase());
      formData.append("directorName", directorName.trim());
      formData.append("directorPhone", directorPhone.trim());
      formData.append("province", province);
      formData.append("username", (username || "admin").trim().toLowerCase());
      formData.append("password", password.trim());

      const res = await registerSchoolAction(formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (res?.schoolCode && onRegisteredSuccess) {
        onRegisteredSuccess(res.schoolCode);
      }

      // If redirectUrl returned, navigate to admin dashboard
      if (res?.redirectUrl) {
        setTimeout(() => {
          window.location.href = res.redirectUrl;
        }, 1200);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message || "حدث خطأ أثناء تسجيل المدرسة، يرجى المحاولة مرة أخرى.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-cairo overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full my-8 overflow-hidden text-right animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white relative flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  تسجيل مدرسة جديدة وتجربة المنظومة
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  14 يوماً مجاناً
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تجهيز فوري لبيئة المدرسة، الصفوف، والمواد المعتمدة بدون أي تكاليف مسبقة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">
                  مبروك! تم إنشاء بيئة مدرستكم بنجاح 🚀
                </h4>
                <p className="text-xs text-slate-600">
                  تم تفعيل باقة التجربة المجانية (14 يوماً)، وجاري توجيهك إلى لوحة الإدارة...
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-emerald-800">
                رمز مدرستكم: {schoolCode}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
                  {error}
                </div>
              )}

              {/* Free Trial Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  ستحصل المدرسة فوراً على فترة تجربة كاملة الميزات (14 يوماً) تشمل إدارة الطلاب والدرجات والوصولات المالية.
                </span>
              </div>

              {/* Row 1: School Name */}
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
                    placeholder="مثال: مدرسة المعالي الأهلية للبنين"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium outline-none transition-all"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Row 2: School Code & Auto Suggest */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    رمز المدرسة بالإنجليزية (School Code) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
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
                    placeholder="مثال: al-nukhba أو frahidi"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                    dir="ltr"
                  />
                  <span className="w-4 h-4 text-slate-400 absolute right-3 top-3 font-mono text-xs">#</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  يستخدم هذا الرمز لتعريف مدرستكم عند تسجيل الدخول من قبل الكادر والطلبة.
                </p>
              </div>

              {/* Row 3: Director Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    اسم المدير / المسؤول <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      placeholder="أ. أحمد جاسم المحترم"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none transition-all"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    رقم الهاتف / الواتساب <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={directorPhone}
                      onChange={(e) => setDirectorPhone(e.target.value)}
                      placeholder="07801234567"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono outline-none transition-all text-left"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Row 4: Province */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  المحافظة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white text-slate-900 text-xs sm:text-sm outline-none transition-all"
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
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Row 5: Admin Credentials */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  بيانات حساب مدير المنظومة:
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
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600">
                      كلمة مرور المدير <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-700"
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
                  className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري تهيئة بيئة مدرستكم وبدء التجربة...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>إنشاء بيئة المدرسة وبدء التجربة المجانية (14 يوماً)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
