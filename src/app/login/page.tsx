"use client";

import React, { useState } from "react";
import { loginAction, quickDemoLogin } from "@/app/actions/authActions";
import {
  Building2,
  Lock,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-cairo">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-950/50 mb-2">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">نظام النخبة لإدارة المدارس</h1>
          <p className="text-xs text-slate-400 font-medium">المنصة المركزية لإدارة المدارس الأهلية والنتائج</p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-3xl border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>تجربة المنظومة بنقرة واحدة (حسابات تجريبية):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => quickDemoLogin("ADMIN")}
              className="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 transition-all text-right flex items-center justify-between group"
            >
              <div>
                <span className="block text-emerald-400 group-hover:text-white">👔 مدير المدرسة</span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-100">صلاحيات كاملة</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => quickDemoLogin("TEACHER_MATH")}
              className="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 transition-all text-right flex items-center justify-between group"
            >
              <div>
                <span className="block text-emerald-400 group-hover:text-white">👨‍🏫 معلم الرياضيات</span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-100">الحصة الأولى مفعّلة</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => quickDemoLogin("TEACHER_ARABIC")}
              className="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 transition-all text-right flex items-center justify-between group"
            >
              <div>
                <span className="block text-emerald-400 group-hover:text-white">👨‍🏫 معلم العربي</span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-100">شعبة ب مفعّلة</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => quickDemoLogin("STUDENT")}
              className="p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-blue-600 border border-slate-700 hover:border-blue-500 transition-all text-right flex items-center justify-between group"
            >
              <div>
                <span className="block text-blue-400 group-hover:text-white">🎓 الطالب كرار</span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-100">الشهادة والأقساط</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
          <h2 className="text-base font-black text-slate-800 text-center">تسجيل الدخول للمنظومة</h2>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="admin أو t.ahmed أو s.karrar"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium transition-all outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium transition-all outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "جاري التحقق والدخول..." : "دخول إلى لوحة التحكم"}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام محمي ومعزول بالكامل بنمط Multi-Tenancy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
