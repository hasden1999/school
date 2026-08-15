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
  CalendarCheck,
  CreditCard,
  ClipboardList,
  Database,
  MessageSquare,
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

interface NavGroup {
  groupTitle: string;
  items: {
    label: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  schoolName = "ثانوية النخبة الأهلية",
  mobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupTitle: "العمليات والمتابعة اليومية",
      items: [
        { label: "لوحة التحكم", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "تسجيل الحضور والغياب", href: "/admin/attendance", icon: UserCheck },
        { label: "التقارير اليومية والواجبات", href: "/admin/reports", icon: FileSpreadsheet },
        { label: "طلبات الإجازة (8:00 ص)", href: "/admin/leaves", icon: CalendarCheck },
      ],
    },
    {
      groupTitle: "الشؤون الأكاديمية والطلاب",
      items: [
        { label: "سجل الطلاب والعربون", href: "/admin/students", icon: GraduationCap },
        { label: "سجل الدرجات والشهادات", href: "/admin/grades", icon: Award },
        { label: "الجدول الدراسي الأسبوعي", href: "/admin/schedule", icon: CalendarDays },
      ],
    },
    {
      groupTitle: "الهيئة التعليمية والتقييم",
      items: [
        { label: "المعلمون والتخصيصات", href: "/admin/teachers", icon: Users },
        { label: "تقييم أداء المعلمين", href: "/admin/evaluation", icon: ClipboardList, badge: "سري" },
      ],
    },
    {
      groupTitle: "الشؤون المالية والتبليغات",
      items: [
        { label: "الأقساط والوصولات", href: "/admin/payments", icon: CreditCard },
        { label: "مركز واتساب والتبليغات", href: "/admin/whatsapp", icon: MessageSquare },
      ],
    },
    {
      groupTitle: "الإدارة والأمان والنظام",
      items: [
        { label: "إعدادات وهوية المدرسة", href: "/admin/settings", icon: Settings },
        { label: "النسخ الاحتياطي وحزمة الطوارئ", href: "/admin/backup", icon: Database },
        { label: "إغلاق العام والترقية", href: "/admin/academic-year", icon: Sparkles },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none font-cairo">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white leading-tight line-clamp-1">{schoolName}</h2>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              بوابة الإدارة المتكاملة
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Grouped */}
      <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h3 className="text-[10px] font-black text-slate-500 px-3 uppercase tracking-wider">
              {group.groupTitle}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onCloseMobile && onCloseMobile()}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/50"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronLeft className="w-3.5 h-3.5 text-white" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950 text-[10px] text-slate-500 text-center font-medium">
        نظام الإدارة المدرسية الشامل — v2.0
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 border-l border-slate-800 no-print flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
            onClick={onCloseMobile}
          />
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideInRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
