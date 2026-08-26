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
    { label: "الأدوار ومصفوفة الصلاحيات", href: "/super-admin/roles", icon: ShieldCheck },
    { label: "سجل الإيرادات والدفعات", href: "/super-admin/billing", icon: CreditCard },
    { label: "التعميمات والإعلانات العامة", href: "/super-admin/broadcast", icon: Megaphone },
  ];

  const sidebarContent = (
    <>
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">لوحة مالك المنظومة</h1>
              <span className="text-[11px] text-slate-500 font-medium">التحكم المركزي</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-0.5">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors duration-150 relative ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold border-r-2 border-emerald-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-emerald-800" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Super Admin User Footer */}
      <div className="p-4 border-t border-slate-200 space-y-2.5 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {(user.fullName || "م").slice(0, 1)}
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-800">{user.fullName || "مالك المنصة"}</span>
              <span className="text-[10px] text-slate-500 tabular-nums" dir="ltr">@{user.username}</span>
            </div>
          </div>

          <button
            onClick={() => logoutAction()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 justify-center pt-2 border-t border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>التحكم المركزي بالسيرفر وقاعدة البيانات</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-row font-cairo text-slate-800 overflow-x-hidden">

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-200 flex-col justify-between hidden lg:flex shrink-0 h-screen sticky top-0 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">
        {/* Top Bar on Mobile */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="القائمة"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">لوحة مالك المنظومة</span>
            </div>
          </div>

          <button
            onClick={() => logoutAction()}
            className="p-2 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-slate-200 overflow-y-auto animate-slideInRight">
            {sidebarContent}
          </div>
        )}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-slate-900/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
