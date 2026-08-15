"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NotificationBellDropdown } from "../notifications/NotificationBellDropdown";
import { usePathname } from "next/navigation";
import { logoutAction, quickDemoLogin } from "@/app/actions/authActions";
import {
  LayoutDashboard,
  UserCheck,
  Award,
  FileSpreadsheet,
  LogOut,
  GraduationCap,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

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
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Hamburger Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight leading-tight">بوابة المعلم المعتمدة</h1>
                <span className="text-[11px] text-emerald-400 font-semibold line-clamp-1">{user.fullName}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Demo Switcher & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center bg-slate-800 rounded-xl p-1 text-xs text-slate-300 gap-1 border border-slate-700">
              <span className="px-1 text-[11px] text-slate-400">تبديل الحساب:</span>
              <button
                onClick={() => quickDemoLogin("ADMIN")}
                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                👔 الإدارة
              </button>
              <button
                onClick={() => quickDemoLogin("STUDENT")}
                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
              >
                🎓 الطالب
              </button>
            </div>

            {/* Notification Bell */}
            <NotificationBellDropdown variant="dark" />

            <button
              onClick={() => logoutAction()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors border border-rose-500/30 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-2xl animate-fadeIn">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>تبديل الحساب:</span>
            <div className="flex gap-2">
              <button
                onClick={() => quickDemoLogin("ADMIN")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 font-bold text-slate-200 border border-slate-700"
              >
                👔 الإدارة
              </button>
              <button
                onClick={() => quickDemoLogin("STUDENT")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 font-bold text-slate-200 border border-slate-700"
              >
                🎓 الطالب
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
