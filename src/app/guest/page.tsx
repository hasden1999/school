import React from "react";
import Link from "next/link";
import {
  SCHOOL_INFO,
  SCHOOL_STATS,
  SCHOOL_FACILITIES,
  SCHOOL_TESTIMONIALS,
} from "@/data/schoolActivitiesData";
import { ActivitiesGallery } from "@/components/activities/ActivitiesGallery";
import { VideoReelsSection } from "@/components/activities/VideoReelsSection";
import {
  Building2,
  Sparkles,
  ArrowRight,
  LogIn,
  GraduationCap,
  ShieldCheck,
  Compass,
  Phone,
  MapPin,
  MessageSquare,
  School,
  Heart,
  Award,
} from "lucide-react";

export const metadata = {
  title: `بوابة الزوار والأنشطة | ${SCHOOL_INFO.name}`,
  description: `استكشف معارض الأنشطة، مقاطع الفيديو، المرافق الذكية، وإنجازات ${SCHOOL_INFO.name}.`,
};

export default function GuestPortalPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-cairo">
      {/* Top Banner */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-brand-700 text-white flex items-center justify-center shadow-card">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">{SCHOOL_INFO.name}</span>
              <span className="text-xs text-brand-700 block font-bold">بوابة الزوار وأولياء الأمور</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold border border-slate-200 shadow-xs transition-all"
            >
              <span>الرئيسية</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-card"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول النظام</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Guest Hero Welcome */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold">
            <Compass className="w-4 h-4" />
            <span>وضع التصفح كـ ضيف مفعّل</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            مرحباً بكم في رحاب <span className="text-brand-700">{SCHOOL_INFO.name}</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            نسعد بزيارتكم الكريمة. تفضلوا باستكشاف معارض الأنشطة العلمية، البطولات الرياضية، مقاطع الفيديو الحية، ومرافق الصرح التعليمي الحديثة.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${SCHOOL_INFO.whatsapp}?text=${encodeURIComponent("السلام عليكم، أود حجز موعد زيارة أو الاستفسار عن التسجيل")}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm shadow-card flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>تواصل مع الإدارة عبر الواتساب</span>
            </a>

            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
            >
              <LogIn className="w-4 h-4 text-brand-700" />
              <span>تسجيل الدخول للمنظومة</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <ActivitiesGallery />

        <VideoReelsSection />

        {/* Facilities Preview */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              المرافق والمختبرات الذكية
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              تجهيزات تعليمية وتقنية متكاملة تضمن تجربة تعليمية رائدة لأبنائنا الطلبة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHOOL_FACILITIES.slice(0, 3).map((fac) => (
              <div
                key={fac.id}
                className="card-surface overflow-hidden shadow-card"
              >
                <div className="relative aspect-video">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-slate-950/55 px-3 py-2">
                    <h3 className="text-sm font-bold text-white">{fac.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة — {SCHOOL_INFO.name} © 2024
      </footer>
    </div>
  );
}
