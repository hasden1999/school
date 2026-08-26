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
        className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-all border-b ${
          isUrgent
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : "bg-brand-50 text-brand-800 border-brand-100"
        }`}
      >
        <div className="flex items-center gap-2">
          {isUrgent ? <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce shrink-0" /> : <Sparkles className="w-4 h-4 text-brand-700 shrink-0" />}
          <span>
            {isUrgent
              ? `تنبيه: متبقي ${Math.max(0, diffDays)} أيام فقط على انتهاء الفترة التجريبية المجانية (14 يوماً)!`
              : `الفترة التجريبية المجانية مفعلة: متبقي ${Math.max(0, diffDays)} يوماً على اكتمال الـ 14 يوماً التجريبية.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] opacity-80">
            لتجديد أو تفعيل الاشتراك السنوي الرسمي للمدرسة:
          </span>
          <a
            href="https://wa.me/9647800000000?text=مرحباً، أود تجديد وتثبيت اشتراك مدرستنا في المنظومة"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-[11px] transition-all flex items-center gap-1"
          >
            تفعيل الاشتراك الدائم
          </a>
        </div>
      </div>
    );
  }

  // 2. Active Subscription
  if (subscriptionStatus === "ACTIVE") {
    if (diffDays <= 7 && diffDays >= 0) {
      return (
        <div className="w-full px-4 py-2 bg-amber-50 text-amber-800 border-b border-amber-200 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>تنبيه التجديد: ينتهي اشتراك المدرسة بعد {diffDays} أيام. يرجى سداد الاشتراك لضمان استمرار الخدمة دون توقف.</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">تجديد الاشتراك</span>
        </div>
      );
    }
    return null;
  }

  return null;
};
