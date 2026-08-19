"use client";

import React from "react";
import { Sparkles, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface SubscriptionBannerProps {
  tenant: {
    name: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
    trialEndsAt: Date | string | null;
    subscriptionExpiresAt: Date | string | null;
  } | null;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ tenant }) => {
  if (!tenant) return null;

  const { subscriptionStatus, trialEndsAt, subscriptionExpiresAt } = tenant;
  const expiryDate = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : (trialEndsAt ? new Date(trialEndsAt) : null);
  
  const now = new Date();
  const diffDays = expiryDate ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // 1. Trial Status (14-Day Free Trial)
  if (subscriptionStatus === "TRIAL") {
    const isUrgent = diffDays <= 3;
    return (
      <div
        className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-all shadow-sm ${
          isUrgent
            ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white"
            : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          {isUrgent ? <AlertTriangle className="w-4 h-4 animate-bounce" /> : <Sparkles className="w-4 h-4" />}
          <span>
            {isUrgent
              ? `⚠️ تنبيه: متبقي ${Math.max(0, diffDays)} أيام فقط على انتهاء الفترة التجريبية المجانية (14 يوماً)!`
              : `⏳ الفترة التجريبية المجانية مفعلة: متبقي ${Math.max(0, diffDays)} يوماً على اكتمال الـ 14 يوماً التجريبية.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] opacity-90">
            لتجديد أو تفعيل الاشتراك السنوي الرسمي للمدرسة:
          </span>
          <a
            href="https://wa.me/9647800000000?text=مرحباً، أود تجديد وتثبيت اشتراك مدرستنا في المنظومة"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 font-black text-[11px] transition-all flex items-center gap-1 border border-white/30"
          >
            تفعيل الاشتراك الدائم 🚀
          </a>
        </div>
      </div>
    );
  }

  // 2. Active Subscription
  if (subscriptionStatus === "ACTIVE") {
    if (diffDays <= 7 && diffDays >= 0) {
      return (
        <div className="w-full px-4 py-2 bg-amber-500 text-slate-950 flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>تنبيه التجديد: ينتهي اشتراك المدرسة بعد {diffDays} أيام. يرجى سداد الاشتراك لضمان استمرار الخدمة دون توقف.</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-white">تجديد الاشتراك</span>
        </div>
      );
    }
    return null;
  }

  return null;
};
