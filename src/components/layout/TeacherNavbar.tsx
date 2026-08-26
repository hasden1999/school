"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NotificationBellDropdown } from "../notifications/NotificationBellDropdown";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/authActions";
import {
  LayoutDashboard,
  UserCheck,
  Award,
  FileSpreadsheet,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { OfflineStatusBar } from "../offline/OfflineStatusBar";

interface TeacherNavbarProps {
  user: {
    fullName: string;
    username: string;
  };
}

export const TeacherNavbar: React.FC<TeacherNavbarProps> = ({ user }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "الرئيسية وجدولي", href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "تسجيل الحضور (الحصة الأولى)", href: "/teacher/attendance", icon: UserCheck },
    { label: "رصد الدرجات المرحلية", href: "/teacher/grades", icon: Award },
    { label: "التقارير اليومية والواجبات", href: "/teacher/reports", icon: FileSpreadsheet },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Hamburger Button + Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
                    مدرسة المعالي الأهلية الابتدائية المختلطة
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/70 shrink-0">
                    تأسست 2017
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-semibold line-clamp-1">
                  بوابة المعلم — {user.fullName}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 font-bold border-b-2 border-emerald-800 rounded-b-none"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-emerald-800" : "text-slate-400"}`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Offline Sync, Notification Bell & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <OfflineStatusBar />

            {/* Notification Bell */}
            <NotificationBellDropdown />

            <button
              onClick={() => logoutAction()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 font-semibold text-xs transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-3 pt-2 pb-4 space-y-0.5 shadow-md animate-fadeIn">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold"
                    : "text-slate-600 hover:bg-slate-100 font-medium"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] ${isActive ? "text-emerald-800" : "text-slate-400"}`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
