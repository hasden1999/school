"use client";

import React from "react";
import { Sparkles, Clock, AlertTriangle, ShieldCheck, MessageCircle } from "lucide-react";

interface SubscriptionBannerProps {
  tenant: {
    name: string;
    code?: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
    trialEndsAt: Date | string | null;
    subscriptionExpiresAt: Date | string | null;
  } | null;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ tenant }) => {
  if (!tenant) return null;

  const { name, code, subscriptionStatus, trialEndsAt, subscriptionExpiresAt } = tenant;
  const expiryDate = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt)
    : trialEndsAt
    ? new Date(trialEndsAt)
    : null;

  const now = new Date();
  const diffDays = expiryDate
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const whatsappPhone = process.env.NEXT_PUBLIC_PLATFORM_WHATSAPP || "9647800000000";
  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.startsWith("0")
    ? "964" + cleanPhone.slice(1)
    : cleanPhone.startsWith("964")
    ? cleanPhone
    : "964" + cleanPhone;

  const msg = `السلام عليكم ورحمة الله، أنا مدير مدرسة (${name}) - رمز المدرسة: (${code || ""}). نود تفعيل النسخة الرسمية للمنظومة وتثبيت الاشتراك.`;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

  // 1. Trial Status (14-Day Free Trial)
  if (subscriptionStatus === "TRIAL") {
    const isUrgent = diffDays <= 3;
    return (
      <div
        className={`w-full px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold transition-all border-b gap-2 z-20 ${
          isUrgent
            ? "bg-amber-500 text-slate-950 border-amber-600"
            : "bg-emerald-50 text-emerald-900 border-emerald-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-slate-950 animate-bounce shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          )}
          <span>
            {isUrgent
              ? `تنبيه عاجل: متبقي ${Math.max(0, diffDays)} أيام فقط على انتهاء التجربة المجانية (14 يوماً)!`
              : `فترة التجربة المجانية مفعلة: متبقي ${Math.max(0, diffDays)} يوماً على اكتمال الـ 14 يوماً التجريبية.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] opacity-90">
            لتفعيل النسخة السنوية الرسمية دون انقطاع:
          </span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-2xs ${
              isUrgent
                ? "bg-slate-950 text-amber-300 hover:bg-slate-900"
                : "bg-emerald-800 text-white hover:bg-emerald-900"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>تفعيل النسخة الرسمية</span>
          </a>
        </div>
      </div>
    );
  }

  // 2. Active Subscription Expiring Soon
  if (subscriptionStatus === "ACTIVE") {
    if (diffDays <= 7 && diffDays >= 0) {
      return (
        <div className="w-full px-4 py-2 bg-amber-50 text-amber-900 border-b border-amber-200 flex flex-wrap items-center justify-between text-xs font-bold gap-2 z-20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              تنبيه التجديد: ينتهي اشتراك المدرسة بعد {diffDays} أيام. يرجى سداد الاشتراك لضمان استمرار الخدمة دون توقف.
            </span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-300 flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>تجديد الاشتراك</span>
          </a>
        </div>
      );
    }
    return null;
  }

  return null;
};
