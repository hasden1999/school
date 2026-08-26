"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SCHOOL_INFO,
  SCHOOL_STATS,
  SCHOOL_FACILITIES,
  SCHOOL_TESTIMONIALS,
  SCHOOL_ANNOUNCEMENTS,
  DEMO_CREDENTIALS,
} from "@/data/schoolActivitiesData";
import { ActivitiesGallery } from "@/components/activities/ActivitiesGallery";
import { VideoReelsSection } from "@/components/activities/VideoReelsSection";
import { StudentAdmissionModal } from "@/components/landing/StudentAdmissionModal";
import { submitJoinRequestAction } from "@/app/actions/superAdminActions";
import {
  Building2,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  CalendarCheck,
  UserCheck,
  CreditCard,
  MessageSquare,
  School,
  Phone,
  MapPin,
  Mail,
  Star,
  LogIn,
  Send,
  X,
} from "lucide-react";

interface Props {
  initialSession?: any;
}

export const SchoolWelcomePortal: React.FC<Props> = ({ initialSession }) => {
  const [showAdmissionModal, setShowAdmissionModal] = useState<boolean>(false);
  const [showSchoolJoinModal, setShowSchoolJoinModal] = useState<boolean>(false);

  // School join state
  const [joinSubmitted, setJoinSubmitted] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleSchoolJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await submitJoinRequestAction(formData);
      if (res?.error) {
        setJoinError(res.error);
      } else {
        setJoinSubmitted(true);
      }
    } catch {
      setJoinError("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً");
    } finally {
      setJoinLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-cairo selection:bg-brand-100 selection:text-brand-900 relative overflow-x-hidden">

      {/* Top Announcement Bar */}
      <div className="bg-slate-900 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-[11px] sm:text-xs font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span>{SCHOOL_ANNOUNCEMENTS[0]}</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 tabular-nums" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {SCHOOL_INFO.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {SCHOOL_INFO.city} - الكرخ
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 block leading-tight truncate">
                  {SCHOOL_INFO.name}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/70 shrink-0">
                  تأسست 2017
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">
                {SCHOOL_INFO.licenseNumber}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-600">
            <button onClick={() => scrollToSection("hero-welcome")} className="hover:text-emerald-800 transition-colors">
              الرئيسية
            </button>
            <button
              onClick={() => scrollToSection("activities-gallery")}
              className="hover:text-emerald-800 transition-colors"
            >
              معرض النشاطات
            </button>
            <button onClick={() => scrollToSection("school-videos")} className="hover:text-emerald-800 transition-colors">
              مقاطع الفيديو
            </button>
            <button onClick={() => scrollToSection("campus-facilities")} className="hover:text-emerald-800 transition-colors">
              مرافق الصرح
            </button>
            <button onClick={() => scrollToSection("system-features")} className="hover:text-emerald-800 transition-colors">
              مميزات المنظومة
            </button>
          </nav>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAdmissionModal(true)}
              className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 hover:border-emerald-700 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>تسجيل طالب جديد</span>
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول النظام</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION & WELCOME PORTAL */}
      <section id="hero-welcome" className="relative pt-14 pb-16 sm:pt-20 sm:pb-20 border-b border-slate-100 overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Hero Header */}
          <div className="max-w-3xl mx-auto text-right space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>مدرسة المعالي الأهلية الابتدائية المختلطة — تأسست سنة 2017</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-[1.25] tracking-tight">
              نصنع قادة المستقبل بالمعرفة والريادة والإبداع
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
              مرحباً بكم في البوابة الرقمية الموحدة لـ{" "}
              <strong className="text-slate-900 font-bold">{SCHOOL_INFO.name}</strong> (تأسست سنة 2017). نجمع بين المناهج الأكاديمية والتربوية الحديثة، الفصول الذكية، الأنشطة التطويرية، ونظام الإدارة السحابي الشامل لأولياء الأمور والتلاميذ.
            </p>

            {/* Quick Action Navigation Hub */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm transition-colors flex items-center gap-2 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول للمنظومة</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowAdmissionModal(true)}
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 font-bold text-sm transition-colors flex items-center gap-2 shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-emerald-800" />
                <span>تقديم طلب قبول طالب جديد</span>
              </button>

              <a
                href={`https://wa.me/${SCHOOL_INFO.whatsapp}?text=${encodeURIComponent("السلام عليكم، أود الاستفسار عن مدرسة المعالي الأهلية الابتدائية المختلطة")}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold text-sm transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>تواصل عبر واتساب</span>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-4">
            {SCHOOL_STATS.map((st, idx) => (
              <div key={idx} className="card-surface p-5 sm:p-6 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {st.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl sm:text-4xl font-bold ${st.color} tabular-nums`}>
                    {st.value}
                  </span>
                  {st.unit && (
                    <span className="text-[11px] font-medium text-slate-400">{st.unit}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {st.description}
                </p>
              </div>
            ))}
          </div>

          {/* Portal Access Panel */}
          <div className="card-surface p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-brand-50 text-brand-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    بوابات الدخول للمنظومة المدرسية الموحدة
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    منظومة متكاملة تتيح الوصول المخصص والآمن لكل دور في الصرح الأكاديمي
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_CREDENTIALS.map((portal) => (
                <div
                  key={portal.role}
                  className="border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-brand-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-slate-900">{portal.roleLabel}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                        {portal.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {portal.desc}
                    </p>
                  </div>

                  <Link
                    href={portal.path}
                    className={`w-full py-2.5 rounded-lg ${portal.color} text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors`}
                  >
                    <span>{`دخول بوابة ${portal.roleLabel.split(" ")[0]}`}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVITIES & PHOTO GALLERY SECTION */}
      <section id="activities-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20">
        <ActivitiesGallery />
      </section>

      {/* VIDEO REELS & HIGHLIGHTS SECTION */}
      <section id="school-videos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20">
        <VideoReelsSection />
      </section>

      {/* CAMPUS FACILITIES & VIRTUAL TOUR */}
      <section id="campus-facilities" className="bg-slate-50 border-y border-slate-200 py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold text-brand-700 tracking-wide">مرافق المدرسة</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              مرافق صُممت لتوفير بيئة تعليمية نموذجية
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              صُممت مباني ومرافق مدرستنا لتوفير بيئة نموذجية تلهم الطلاب على الإبداع والبحث العلمي والنشاط البدني المتكامل.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCHOOL_FACILITIES.map((fac) => (
              <div key={fac.id} className="card-surface overflow-hidden flex flex-col group">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-brand-700 block">
                      {fac.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{fac.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {fac.description}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                    {fac.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS & PARENT REVIEWS */}
      <section id="school-testimonials" className="bg-slate-50 border-y border-slate-200 py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold text-brand-700 tracking-wide">آراء وشهادات</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              ماذا يقول أولياء الأمور والطلبة عنا؟
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              شهادات نعتز بها من أهالي طلبتنا وخريجينا المتميزين الذين واكبوا مسيرة نجاحنا عاماً بعد عام.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHOOL_TESTIMONIALS.map((test) => (
              <figure key={test.id} className="card-surface p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5" aria-label={`التقييم ${test.rating} من 5`}>
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-100">
                      {test.badge}
                    </span>
                  </div>

                  <blockquote className="text-[13px] text-slate-600 leading-relaxed">
                    {test.content}
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={test.avatar}
                    alt=""
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900">{test.name}</h4>
                    <span className="text-[11px] text-slate-500 block">{test.role}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US & SYSTEM FEATURES */}
      <section id="system-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 scroll-mt-16">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold text-brand-700 tracking-wide">مميزات المنظومة</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            نظام إداري وتعليمي متكامل وفق معايير وزارة التربية
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            منظومة متكاملة تجمع بين قوة التدريس، دقة المتابعة، والتقنيات السحابية الأحدث في العراق.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">نظام درجات وسعي وزاري رسمي</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              مطابق تماماً لتعليمات وزارة التربية العراقية (شهري 1 و 2، نصف السنة، شهري 3 و 4، السعي السنوي والنهائي) مع حساب آلي للأعشار والتقريب الرسمي.
            </p>
          </div>

          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">حضور الحصة الأولى الذكي</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              رصد الحضور الصباحي الدقيق من قبل مدرس الحصة الأولى المسند بالجدول، مع ربط آلي لطلبات الإجازة المعتمدة عند الساعة 8:00 صباحاً.
            </p>
          </div>

          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">أتمتة إشعارات واتساب الفورية</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              إشعارات مباشرة لولي الأمر عند تسجيل الغياب، اعتماد التقارير اليومية والواجبات، إصدار الوصولات المالية، وإعلان النتائج المدرسية.
            </p>
          </div>

          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">التقارير اليومية والواجبات المنزلية</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              توثيق يومي لمفردات المنهج المشروحة والواجبات المطلوبة لكل مادة دراسية مع نظام اعتماد إداري قبل النشر للطلاب وأولياء الأمور.
            </p>
          </div>

          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">إدارة الأقساط والوصولات الرسمية</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              وصولات مالية برقم تسلسلي موحد، باركود QR، تتبع تلقائي للمتبقي من الأقساط السنوية وخصومات الأخوة، وتقارير محاسبية مفصلة.
            </p>
          </div>

          <div className="card-surface p-6 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">أمان وعزل تام للبيانات (SaaS)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              عزل تام للمعلومات وقواعد البيانات، تشفير كامل لكلمات المرور، ونسخ احتياطي فوري ثنائي (قاعدة بيانات + حزمة طوارئ PDF).
            </p>
          </div>
        </div>
      </section>

      {/* ADMISSION BANNER CALL-TO-ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-emerald-900 rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <GraduationCap className="w-4 h-4" />
              باب التسجيل مفتوح للعام الدراسي {SCHOOL_INFO.activeYear}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              احجز مقعد ابنك في رحاب مدرسة المعالي الأهلية الابتدائية المختلطة
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              تأسست سنة 2017 — المقاعد محدودة لضمان الكثافة الصفية النموذجية والرعاية التربوية المتكاملة. احصل على استشارة وقبول فوري الآن.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowAdmissionModal(true)}
              className="px-6 py-3.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>تقديم طلب التسجيل</span>
            </button>

            <button
              onClick={() => {
                setShowSchoolJoinModal(true);
                setJoinSubmitted(false);
                setJoinError(null);
              }}
              className="px-6 py-3.5 rounded-lg border border-emerald-300/40 hover:border-emerald-200 text-emerald-50 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <School className="w-4 h-4" />
              <span>تفعيل مدرسة جديدة (SaaS)</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 pt-14 pb-10 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* School Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-800 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{SCHOOL_INFO.name}</h4>
                  <span className="text-[11px] text-slate-500">{SCHOOL_INFO.city} - العراق</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {SCHOOL_INFO.tagline}. نلتزم بأعلى المعايير الأكاديمية والتربوية لإعداد جيل متميز وواثق.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">روابط سريعة</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><button onClick={() => scrollToSection("hero-welcome")} className="hover:text-brand-800">الرئيسية وبوابة الدخول</button></li>
                <li><button onClick={() => scrollToSection("activities-gallery")} className="hover:text-brand-800">معرض الأنشطة والفعاليات</button></li>
                <li><button onClick={() => scrollToSection("school-videos")} className="hover:text-brand-800">مقاطع الفيديو المصورة</button></li>
                <li><button onClick={() => scrollToSection("campus-facilities")} className="hover:text-brand-800">المرافق والمختبرات</button></li>
                <li><button onClick={() => setShowAdmissionModal(true)} className="hover:text-brand-800">طلب تسجيل وقبول طالب</button></li>
              </ul>
            </div>

            {/* Portal Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">بوابات المنظومة</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/login" className="hover:text-brand-800">بوابة مدير المدرسة</Link></li>
                <li><Link href="/login" className="hover:text-brand-800">بوابة الكادر التدريسي</Link></li>
                <li><Link href="/login" className="hover:text-brand-800">بوابة الطالب وولي الأمر</Link></li>
                <li><Link href="/super-admin/dashboard" className="hover:text-brand-800">إدارة المنصة المركزية</Link></li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">معلومات التواصل</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-700 shrink-0" />
                  <span className="tabular-nums" dir="ltr">{SCHOOL_INFO.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-700 shrink-0" />
                  <span dir="ltr">{SCHOOL_INFO.email}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                  <span>{SCHOOL_INFO.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>
              جميع الحقوق محفوظة © {SCHOOL_INFO.name} — نظام SaaS لإدارة المدارس الأهلية 2024
            </span>
            <span className="font-semibold">{SCHOOL_INFO.licenseNumber}</span>
          </div>
        </div>
      </footer>

      {/* STUDENT ADMISSION MODAL */}
      <StudentAdmissionModal
        isOpen={showAdmissionModal}
        onClose={() => setShowAdmissionModal(false)}
      />

      {/* SCHOOL JOIN / B2B TRIAL REQUEST MODAL */}
      {showSchoolJoinModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 w-full max-w-md shadow-pop space-y-5 animate-scaleUp text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-lg bg-brand-50 text-brand-700">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">طلب تفعيل مدرسة جديدة</h3>
                  <span className="text-[11px] text-slate-500">فترة تجريبية 14 يوماً مجاناً</span>
                </div>
              </div>

              <button
                onClick={() => setShowSchoolJoinModal(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {joinSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">تم استلام طلب مدرستك بنجاح</h4>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    سيتواصل معك فريق إدارة المنظومة عبر الواتساب لتسليم حساب المدير وتفعيل مدرستك فوراً.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchoolJoinModal(false)}
                  className="px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSchoolJoinSubmit} className="space-y-4 text-xs">
                {joinError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                    {joinError}
                  </div>
                )}

                <div>
                  <label htmlFor="join-school-name" className="block font-semibold text-slate-700 mb-1.5">
                    اسم المدرسة الأهلية <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="join-school-name"
                    type="text"
                    name="schoolName"
                    required
                    placeholder="مثال: ثانوية الفراهيدي الأهلية"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-sm text-slate-900 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="join-director" className="block font-semibold text-slate-700 mb-1.5">
                      اسم المدير / المفوض <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="join-director"
                      type="text"
                      name="directorName"
                      required
                      placeholder="أستاذ ..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-sm text-slate-900 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="join-province" className="block font-semibold text-slate-700 mb-1.5">المحافظة</label>
                    <select
                      id="join-province"
                      name="province"
                      defaultValue="بغداد"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-sm text-slate-900 outline-none transition-colors"
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
                  <label htmlFor="join-phone" className="block font-semibold text-slate-700 mb-1.5">
                    رقم هاتف الإدارة / الواتساب <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="join-phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="07XXXXXXXXX"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 text-sm text-slate-900 outline-none tabular-nums transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    سيتم إرسال بيانات دخول المدير عبر هذا الرقم في الواتساب.
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={joinLoading}
                    className="flex-1 py-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors disabled:opacity-60"
                  >
                    {joinLoading ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSchoolJoinModal(false)}
                    className="px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
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
