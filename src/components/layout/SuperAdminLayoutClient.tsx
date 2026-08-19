"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/authActions";
import {
  Crown,
  LayoutDashboard,
  Building2,
  CreditCard,
  Megaphone,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Globe2,
} from "lucide-react";

interface SuperAdminLayoutClientProps {
  children: React.ReactNode;
  user: any;
}

export const SuperAdminLayoutClient: React.FC<SuperAdminLayoutClientProps> = ({
  children,
  user,
}) => {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const links = [
    { label: "المؤشرات المركزية", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "إدارة المدارس والاشتراكات", href: "/super-admin/schools", icon: Building2 },
    { label: "سجل الإيرادات والدفعات", href: "/super-admin/billing", icon: CreditCard },
    { label: "التعميمات والإعلانات العامة", href: "/super-admin/broadcast", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-row font-cairo text-slate-100 overflow-x-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-slate-900/90 border-l border-slate-800 flex flex-col justify-between hidden lg:flex shrink-0 h-screen sticky top-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                <Crown className="w-7 h-7 text-amber-100" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight">لوحة مالك المنظومة</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-400 font-bold">Super Admin Master</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Super Admin User Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                👑
              </div>
              <div>
                <span className="block text-xs font-black text-white">{user.fullName || "مالك المنصة"}</span>
                <span className="text-[10px] text-emerald-400 font-mono">@{user.username}</span>
              </div>
            </div>

            <button
              onClick={() => logoutAction()}
              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>التحكم المركزي بالسيرفر وقاعدة البيانات</span>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-950">
        {/* Top Bar on Mobile */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black text-white">لوحة مالك المنظومة</span>
            </div>
          </div>

          <button
            onClick={() => logoutAction()}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-900 p-4 space-y-2 animate-fadeIn">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs ${
                    isActive ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
