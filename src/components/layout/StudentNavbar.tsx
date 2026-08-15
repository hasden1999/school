"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBellDropdown } from "../notifications/NotificationBellDropdown";
import { logoutAction, quickDemoLogin } from "@/app/actions/authActions";
import {
  LayoutDashboard,
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FolderLock,
  MessageSquareHeart,
  LogOut,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

interface StudentNavbarProps {
  user: {
    fullName: string;
    username: string;
  };
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({ user }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "الرئيسية", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "درجاتي وشهادتي", href: "/student/grades", icon: Award },
    { label: "الواجبات والدروس", href: "/student/reports", icon: BookOpen },
    { label: "طلب إجازة", href: "/student/leaves", icon: CalendarCheck },
    { label: "الأقساط والوصولات", href: "/student/payments", icon: CreditCard },
    { label: "المستمسكات", href: "/student/documents", icon: FolderLock },
    { label: "تقييم الأستاذ (سري)", href: "/student/evaluation", icon: MessageSquareHeart },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Hamburger Button + Profile Info */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100 shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800 tracking-tight leading-tight">بوابة الطالب</h1>
                <span className="text-xs text-blue-600 font-bold line-clamp-1">{user.fullName}</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 text-xs text-slate-600 gap-1 border border-slate-200">
              <span className="px-1 text-[11px] text-slate-400">معاينة:</span>
              <button
                onClick={() => quickDemoLogin("ADMIN")}
                className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
              >
                👔 الإدارة
              </button>
              <button
                onClick={() => quickDemoLogin("TEACHER_MATH")}
                className="px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
              >
                👨‍🏫 المعلم
              </button>
            </div>

            {/* Notification Bell */}
            <NotificationBellDropdown />

            <button
              onClick={() => logoutAction()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition-colors border border-rose-200 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fadeIn">
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
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>تبديل فوري:</span>
            <div className="flex gap-2">
              <button
                onClick={() => quickDemoLogin("ADMIN")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800"
              >
                👔 الإدارة
              </button>
              <button
                onClick={() => quickDemoLogin("TEACHER_MATH")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800"
              >
                👨‍🏫 المعلم
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
