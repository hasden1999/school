"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  Settings,
  X,
  Plus,
  ShieldCheck,
  Award,
  UserCheck,
  ChevronLeft,
  Sparkles,
  Zap,
} from "lucide-react";

interface AdminSidebarProps {
  schoolName?: string;
  user?: any;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  schoolName = "مدرسة المعالي الأهلية الابتدائية المختلطة",
  user,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // 4 Master Pillars Architecture (4 أقسام رئيسية ومختصرة فقط)
  const masterPillars = [
    {
      id: "DASHBOARD",
      label: "الرئيسية والمتابعة",
      subLabel: "ملخص اليوم والعمليات",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      activeRoutes: ["/admin/dashboard", "/admin"],
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      id: "STUDENTS_ACADEMIC",
      label: "الطلاب والدرجات",
      subLabel: "الطلبة، الشهادات، الحضور، الجداول",
      href: "/admin/students",
      icon: GraduationCap,
      activeRoutes: [
        "/admin/students",
        "/admin/grades",
        "/admin/attendance",
        "/admin/schedule",
        "/admin/reports",
        "/admin/leaves",
        "/admin/evaluation",
      ],
      color: "text-blue-700 bg-blue-50 border-blue-200",
      subItems: [
        { label: "كشف الطلبة والمستمسكات", href: "/admin/students" },
        { label: "رصد الدرجات والشهادات", href: "/admin/grades" },
        { label: "الحضور والغياب اليومي", href: "/admin/attendance" },
        { label: "الجدول الأسبوعي والواجبات", href: "/admin/schedule" },
      ],
    },
    {
      id: "FINANCE_PAYMENTS",
      label: "الحسابات والأقساط",
      subLabel: "سندات القبض، تخفيض الأقساط، الخزينة",
      href: "/admin/payments",
      icon: CreditCard,
      activeRoutes: ["/admin/payments"],
      color: "text-amber-700 bg-amber-50 border-amber-200",
      subItems: [
        { label: "سندات القبض والأقساط", href: "/admin/payments" },
        { label: "تخفيض الأقساط والمنح", href: "/admin/payments" },
      ],
    },
    {
      id: "MANAGEMENT_STAFF",
      label: "الكادر والإدارة والصلاحيات",
      subLabel: "المعلمين، الصلاحيات، هوية المدرسة",
      href: "/admin/permissions",
      icon: Settings,
      activeRoutes: [
        "/admin/permissions",
        "/admin/teachers",
        "/admin/settings",
        "/admin/backup",
        "/admin/whatsapp",
        "/admin/academic-year",
      ],
      color: "text-purple-700 bg-purple-50 border-purple-200",
      subItems: [
        { label: "صلاحيات الموظفين والطلاب", href: "/admin/permissions" },
        { label: "الهيئة التدريسية والكادر", href: "/admin/teachers" },
        { label: "إعدادات هوية المدرسة", href: "/admin/settings" },
        { label: "النسخ الاحتياطي للطوارئ", href: "/admin/backup" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Modern Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-xl" : "translate-x-full lg:translate-x-0"
        } font-cairo`}
      >
        {/* Top: School Identity Branding */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              prefetch={true}
              onClick={onCloseMobile}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                معالي
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate leading-tight group-hover:text-emerald-800 transition-colors">
                  {schoolName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  تأسست 2017
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions 1-Click Pill */}
          <div className="p-3">
            <Link
              href="/admin/students"
              prefetch={true}
              onClick={onCloseMobile}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل تلميذ جديد ➕</span>
            </Link>
          </div>

          {/* Navigation Master Pillars (4 أقسام فقط) */}
          <nav className="p-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 px-3 block">
              أقسام المنظومة الرئيسية (4 محاور)
            </span>

            {masterPillars.map((pillar) => {
              const Icon = pillar.icon;
              const currentPath = pathname || "";
              const isActive = pillar.activeRoutes.some(
                (route) => currentPath === route || (currentPath && currentPath.startsWith(route + "/"))
              );

              return (
                <div key={pillar.id} className="space-y-1">
                  <Link
                    href={pillar.href}
                    prefetch={true}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-xs font-bold"
                        : "text-slate-700 hover:bg-slate-100/80 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs sm:text-sm block leading-tight">
                          {pillar.label}
                        </span>
                        <span
                          className={`text-[10px] block truncate leading-tight mt-0.5 ${
                            isActive ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          {pillar.subLabel}
                        </span>
                      </div>
                    </div>

                    <ChevronLeft
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? "text-white" : "text-slate-300"
                      }`}
                    />
                  </Link>

                  {/* Context Sub-links if active */}
                  {isActive && pillar.subItems && (
                    <div className="pr-12 pl-2 py-1 space-y-1">
                      {pillar.subItems.map((sub, idx) => (
                        <Link
                          key={idx}
                          href={sub.href}
                          prefetch={true}
                          onClick={onCloseMobile}
                          className={`block px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            pathname === sub.href
                              ? "text-emerald-800 bg-emerald-50"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          • {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Status Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(user?.fullName || "م").charAt(0)}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user?.fullName || "مدير المدرسة"}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold block">
                  {user?.role === "ADMIN" ? "المالك / المدير العام" : "كادر الإدارة"}
                </span>
              </div>
            </div>
            <Link
              href="/admin/permissions"
              prefetch={true}
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-slate-100"
              title="إدارة الصلاحيات"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
