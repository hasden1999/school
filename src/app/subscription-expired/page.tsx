import React from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolSuspendedView } from "@/components/billing/SchoolSuspendedView";
import { getPlatformContactInfoAction, getSchoolExpiredDetailsAction } from "@/app/actions/authActions";
import Link from "next/link";
import { ShieldAlert, Building2, ChevronLeft } from "lucide-react";

export const revalidate = 0;

interface SubscriptionExpiredPageProps {
  searchParams: {
    code?: string;
  };
}

export default async function SubscriptionExpiredPage({
  searchParams,
}: SubscriptionExpiredPageProps) {
  const session = await getSession();
  const contactInfo = await getPlatformContactInfoAction();

  let school: any = null;

  // 1. If school code passed in URL
  if (searchParams?.code) {
    const details = await getSchoolExpiredDetailsAction(searchParams.code);
    if (details?.school) {
      school = details.school;
    }
  }

  // 2. Fallback to session tenant if authenticated
  if (!school && session?.tenantId) {
    school = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: {
        id: true,
        name: true,
        code: true,
        directorName: true,
        phone: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
      },
    });
  }

  // 3. If school still not found, render a friendly platform contact screen
  if (!school) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-cairo" dir="rtl">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">انتهت فترة التجربة المجانية</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              يرجى التواصل مع إدارة ومالك المنظومة لتفعيل النسخة الرسمية لمدرستكم ومتابعة إدارة الطلاب والدرجات.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("السلام عليكم، نود تفعيل النسخة الرسمية للمنظومة لمدرستنا")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>تواصل مع صاحب المنصة عبر الواتساب</span>
            </a>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>العودة لشاشة الدخول</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <SchoolSuspendedView school={school} contactInfo={contactInfo} />;
}
