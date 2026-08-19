"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  UserCheck,
  Award,
  FileSpreadsheet,
  CreditCard,
  Building2,
  Settings,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  schoolName?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  schoolName = "مدرسة النخبة الأهلية",
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  // Core Essential Navigation Pillars - Streamlined & Focused
  const primaryNavItems = [
    {
      label: "لوحة التحكم",
      subLabel: "المؤشرات والعمليات اليومية",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "سجل الطلاب والقبول",
      subLabel: "البيانات والوثائق والأقساط",
      href: "/admin/students",
      icon: GraduationCap,
    },
    {
      label: "تسجيل الحضور والغياب",
      subLabel: "الدوام اليومي والإجازات",
      href: "/admin/attendance",
      icon: UserCheck,
    },
    {
      label: "سجل الدرجات والشهادات",
      subLabel: "رصد الفصول والنتائج الرسمية",
      href: "/admin/grades",
      icon: Award,
    },
    {
      label: "التقارير والواجبات",
      subLabel: "متابعة الدروس والأنشطة",
      href: "/admin/reports",
      icon: FileSpreadsheet,
    },
    {
      label: "الجدول الأسبوعي",
      subLabel: "الحصص والبديل الذكي",
      href: "/admin/schedule",
      icon: CalendarDays,
    },
    {
      label: "الهيئة التعليمية",
      subLabel: "المعلمون والتخصيصات والتقييم",
      href: "/admin/teachers",
      icon: Users,
    },
    {
      label: "الأقساط والمالية",
      subLabel: "الوصولات وسندات القبض",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      label: "إعدادات وهوية المدرسة",
      subLabel: "المرحلة والشعار والنسخ الاحتياطي",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none font-cairo border-l border-slate-800/80">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-black text-white leading-tight truncate">{schoolName}</h2>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              لوحة الإدارة السريعة
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 group ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/90"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl transition-colors shrink-0 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="text-right truncate">
                  <p className="text-xs font-black leading-snug">{item.label}</p>
                  <p
                    className={`text-[10px] truncate leading-tight ${
                      isActive ? "text-emerald-100" : "text-slate-500 group-hover:text-slate-400"
                    }`}
                  >
                    {item.subLabel}
                  </p>
                </div>
              </div>

              {isActive ? (
                <ChevronLeft className="w-4 h-4 text-white shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-slate-700 shrink-0"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Access Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[10px] text-slate-500 font-bold">منظومة النخبة v2.5</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-[10px] text-emerald-400 font-bold">متصل سحابياً</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 no-print flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
