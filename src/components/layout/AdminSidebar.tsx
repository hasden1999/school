"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  hasPermission,
  type SystemPermission,
  getRoleLabel,
} from "@/lib/permissions";
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
  ShieldCheck,
  CalendarRange,
  Clock,
  MessageSquare,
} from "lucide-react";

interface AdminSidebarProps {
  schoolName?: string;
  user?: any;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  subLabel: string;
  href: string;
  icon: any;
  permission?: SystemPermission;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  schoolName = "مدرسة المعالي الأهلية الابتدائية المختلطة",
  user,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  // Categorized Navigation Pillars for Complete Iraqi School Management
  const navCategories = [
    {
      title: "العمليات والمتابعة اليومية",
      items: [
        {
          label: "لوحة التحكم",
          subLabel: "المؤشرات والعمليات المباشرة",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "تسجيل الحضور الصباحي",
          subLabel: "الحصة الأولى والمتابعة",
          href: "/admin/attendance",
          icon: UserCheck,
          permission: "MANAGE_ATTENDANCE" as SystemPermission,
        },
        {
          label: "سجل الدرجات والشهادات",
          subLabel: "الامتحانات والشيت الموحد",
          href: "/admin/grades",
          icon: Award,
          permission: "MANAGE_GRADES" as SystemPermission,
        },
        {
          label: "التقارير اليومية والواجبات",
          subLabel: "دفتر اليومية الإلكتروني",
          href: "/admin/reports",
          icon: FileSpreadsheet,
          permission: "MANAGE_REPORTS" as SystemPermission,
        },
        {
          label: "طلبات الإجازات والغياب",
          subLabel: "متابعة غيابات الكادر والطلبة",
          href: "/admin/leaves",
          icon: Clock,
          permission: "MANAGE_ATTENDANCE" as SystemPermission,
        },
      ],
    },
    {
      title: "الإدارة الأكاديمية والطلبة",
      items: [
        {
          label: "سجل الطلبة والمستمسكات",
          subLabel: "الوثائق والبيانات الشخصية",
          href: "/admin/students",
          icon: GraduationCap,
          permission: "MANAGE_STUDENTS" as SystemPermission,
        },
        {
          label: "الهيئة التدريسية والموظفون",
          subLabel: "الملفات والأنصبة الأسبوعية",
          href: "/admin/teachers",
          icon: Users,
          permission: "MANAGE_TEACHERS" as SystemPermission,
        },
        {
          label: "الجدول الأسبوعي والبدلاء",
          subLabel: "توليد الجداول وإدارة الغيابات",
          href: "/admin/schedule",
          icon: CalendarDays,
          permission: "MANAGE_SCHEDULE" as SystemPermission,
        },
        {
          label: "تقييم المدرسين (السري)",
          subLabel: "استبيانات الطلبة والمؤشرات",
          href: "/admin/evaluation",
          icon: ShieldCheck,
          permission: "MANAGE_EVALUATION" as SystemPermission,
        },
      ],
    },
    {
      title: "المالية والشؤون الإدارية",
      items: [
        {
          label: "سندات القبض والأقساط",
          subLabel: "الوصولات المختومة والمحاسبة",
          href: "/admin/payments",
          icon: CreditCard,
          permission: "MANAGE_PAYMENTS" as SystemPermission,
        },
        {
          label: "طابور رسائل واتساب",
          subLabel: "الإشعارات الآلية لأولياء الأمور",
          href: "/admin/whatsapp",
          icon: MessageSquare,
          permission: "MANAGE_WHATSAPP" as SystemPermission,
        },
        {
          label: "العام الدراسي والترحيل",
          subLabel: "إغلاق السنة وترفيع الصفوف",
          href: "/admin/academic-year",
          icon: CalendarRange,
          permission: "MANAGE_SETTINGS" as SystemPermission,
        },
      ],
    },
    {
      title: "إعدادات المنظومة وهوية المدرسة",
      items: [
        {
          label: "هوية المدرسة والختم",
          subLabel: "الشعار والباركود والبيانات الرسمية",
          href: "/admin/settings",
          icon: Settings,
          permission: "MANAGE_SETTINGS" as SystemPermission,
        },
        {
          label: "حزمة الطوارئ والنسخ",
          subLabel: "تصدير وتأمين قاعدة البيانات",
          href: "/admin/backup",
          icon: Building2,
          permission: "MANAGE_BACKUP" as SystemPermission,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 select-none font-cairo border-l border-slate-200 shadow-xs">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
              {schoolName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                تأسست 2017
              </span>
              <span className="text-[10px] text-slate-500 truncate font-medium">
                {user?.jobTitle || getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none">
        {navCategories.map((cat, idx) => {
          const visibleItems = cat.items.filter((item) => {
            if (!item.permission) return true;
            if (!user) return true;
            return hasPermission(user, item.permission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-0.5">
              <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {cat.title}
              </div>

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => onCloseMobile && onCloseMobile()}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group relative ${
                      isActive
                        ? "bg-emerald-50/90 text-emerald-900 font-bold border-r-2 border-emerald-800"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 transition-colors ${
                        isActive ? "text-emerald-800" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug truncate">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.fullName?.charAt(0) || "؟"}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {user?.fullName || "المستخدم"}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {user?.jobTitle || getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0"
            title="متصل بالمنظومة"
          >
            متصل
          </span>
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
            className="fixed inset-0 bg-slate-900/50 transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-pop z-10 animate-slideInRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
