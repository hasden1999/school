"use client";

import React, { useState } from "react";
import { loginAction } from "@/app/actions/authActions";
import { submitJoinRequestAction } from "@/app/actions/superAdminActions";
import {
  Building2,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  School,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const LoginClient: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinSubmitted, setJoinSubmitted] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
      }
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await submitJoinRequestAction(formData);

      if (result?.error) {
        setJoinError(result.error);
      } else {
        setJoinSubmitted(true);
      }
    } catch (err: any) {
      setJoinError("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-cairo text-slate-100">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-2xl shadow-emerald-500/20 mb-2 border border-emerald-400/30">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            منظومة النخبة لإدارة المدارس
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            بوابة الدخول السحابية الموحدة (المدراء، الكوادر التعليمية، والطلاب)
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-lg shadow-rose-950/40 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 text-center">
            <h2 className="text-base font-black text-white">تسجيل الدخول المباشر</h2>
            <p className="text-xs text-slate-400 mt-1">
              أدخل اسم المستخدم وكلمة المرور للدخول الفوري لحسابك
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المستخدم / الحساب <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  autoFocus
                  placeholder="اسم المستخدم أو الحساب الخماسي (مثل: admin أو krznb)"
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs sm:text-sm font-medium text-white transition-all outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة المرور / الرمز السري <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="أدخل كلمة المرور أو الرمز الخماسي"
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs sm:text-sm font-medium text-white transition-all outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حفظ تسجيل الدخول التلقائي مفعل (لمدة سنة)</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? "جاري التحقق والمصادقة..." : "تسجيل الدخول للمنظومة 🚀"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* School Lead Capture Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-5 rounded-3xl border border-emerald-500/20 shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خاص بالمدارس الأهلية الجديدة</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">هل تود تفعيل المنظومة لمدرستك الأهلية؟</h3>
            <p className="text-xs text-slate-400 mt-1">
              استفد من تجربة مجانية كاملة الميزات لمدة 14 يوماً وتدريب كامل لكادرك التعليمي
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowJoinModal(true);
              setJoinSubmitted(false);
              setJoinError(null);
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <School className="w-4 h-4" />
            <span>طلب انضمام مدرسة وتجربة 14 يوماً مجاناً 🚀</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>منظومة سحابية مشفرة بمعايير العزل التام للبيانات (Multi-Tenant SaaS)</span>
        </div>

      </div>

      {/* JOIN REQUEST MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5 animate-scaleUp text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">طلب تفعيل مدرسة جديدة</h3>
                  <span className="text-[11px] text-emerald-400">فترة تجريبية 14 يوماً مجاناً</span>
                </div>
              </div>

              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {joinSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white">تم استلام طلب مدرستك بنجاح!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed px-2">
                    سيتواصل معك فريق إدارة المنظومة عبر الواتساب لتسليم حساب المدير وتفعيل مدرستك فوراً.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
                {joinError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                    ⚠️ {joinError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    اسم المدرسة الأهلية <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    required
                    placeholder="مثال: ثانوية الفراهيدي الأهلية"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">
                      اسم المدير / المفوض <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="directorName"
                      required
                      placeholder="أستاذ ..."
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">المحافظة</label>
                    <select
                      name="province"
                      defaultValue="بغداد"
                      className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none"
                    >
                      <option value="بغداد">بغداد</option>
                      <option value="البصرة">البصرة</option>
                      <option value="أربيل">أربيل</option>
                      <option value="النجف الأشرف">النجف</option>
                      <option value="كربلاء المقدسة">كربلاء</option>
                      <option value="نينوى">الموصل</option>
                      <option value="بابل">بابل</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    رقم هاتف الإدارة / الواتساب <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="078XXXXXXXX"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 text-white font-mono outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    سيتم إرسال بيانات دخول المدير عبر هذا الرقم في الواتساب.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={joinLoading}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {joinLoading ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام والتفعيل 🚀"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
