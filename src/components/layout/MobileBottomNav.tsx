"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  CreditCard,
  Settings,
} from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname() || "";

  // Only show on admin routes
  if (!pathname || !pathname.startsWith("/admin")) {
    return null;
  }

  const navTabs = [
    {
      label: "الرئيسية",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      activeRoutes: ["/admin/dashboard", "/admin"],
    },
    {
      label: "الطلاب والدرجات",
      href: "/admin/students",
      icon: GraduationCap,
      activeRoutes: [
        "/admin/students",
        "/admin/grades",
        "/admin/attendance",
        "/admin/schedule",
        "/admin/reports",
        "/admin/leaves",
      ],
    },
    {
      label: "الحسابات والأقساط",
      href: "/admin/payments",
      icon: CreditCard,
      activeRoutes: ["/admin/payments"],
    },
    {
      label: "الكادر والصلاحيات",
      href: "/admin/permissions",
      icon: Settings,
      activeRoutes: [
        "/admin/permissions",
        "/admin/teachers",
        "/admin/settings",
        "/admin/backup",
      ],
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden px-2 py-1.5 font-cairo shadow-lg">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.activeRoutes.some(
            (route) => pathname === route || (pathname && pathname.startsWith(route + "/"))
          );

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-800 font-bold bg-emerald-50"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-emerald-800 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
