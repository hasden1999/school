"use client";

import React from "react";
import { ShieldAlert, Phone, LogOut, ExternalLink } from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";

interface SchoolSuspendedViewProps {
  school: {
    name: string;
    code: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
    trialEndsAt?: Date | string | null;
    subscriptionExpiresAt?: Date | string | null;
    phone?: string | null;
  };
}

export const SchoolSuspendedView: React.FC<SchoolSuspendedViewProps> = ({ school }) => {
  const isTrial = school.subscriptionStatus === "TRIAL";
  const whatsappMsg = `السلام عليكم ورحمة الله وبركاته،\nأنا مدير مدرسة (${school.name}) - رمز المدرسة: (${school.code}).\nنود تجديد وتفعيل اشتراك المنظومة السحابية لمدرستنا.\nيرجى تزويدنا بتفاصيل التجديد وتفعيل الاشتراك.`;
  const whatsappUrl = `https://wa.me/9647800000000?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-cairo">
      <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            {isTrial ? "انتهت فترة التجربة المجانية (14 يوماً)" : "الاشتراك معلق حالياً (SUSPENDED)"}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            مطلوب تجديد اشتراك المدرسة
          </h1>
          <p className="text-sm font-semibold text-slate-300">
            {school.name} <span className="text-slate-400 font-mono text-xs">({school.code})</span>
          </p>
        </div>

        {/* Informative Explanation */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed text-right space-y-2">
          <p>
            نود إعلامكم بأن صلاحية استخدام المنظومة السحابية لمدرستكم معلقة حالياً لانتهاء فترة الصلاحية أو انتهاء فترة التجربة المجانية.
          </p>
          <p className="text-emerald-400 font-bold">
            🛡️ مطمئنون: كافة سجلاتكم ودرجات الطلاب والوصولات المالية محفوظة بأمان تام في قاعدة البيانات، وستعود للعمل فور تجديد التفعيل.
          </p>
        </div>

        {/* Call To Actions */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>تواصل مع الإدارة لتجديد الاشتراك فوراً (واتساب)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والعودة لشاشة الدخول</span>
            </button>
          </form>
        </div>

        {/* System Support Footnote */}
        <p className="text-[11px] text-slate-400">
          منظومة إدارة المدارس المركزية (SaaS) — هاتف الدعم الفني المباشر: 07800000000
        </p>
      </div>
    </div>
  );
};
