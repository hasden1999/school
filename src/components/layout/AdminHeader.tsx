"use client";

import React, { useState } from "react";
import { logoutAction } from "@/app/actions/authActions";
import {
  Bell,
  Clock,
  LogOut,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Menu,
  Radio,
} from "lucide-react";
import { CronSimulatorModal } from "../cron/CronSimulatorModal";
import { WhatsAppQueueDrawer } from "../whatsapp/WhatsAppQueueDrawer";
import { NotificationBellDropdown } from "../notifications/NotificationBellDropdown";
import { GlobalCommandPalette } from "../navigation/GlobalCommandPalette";
import { OfflineStatusBar } from "../offline/OfflineStatusBar";
import { SchoolNetworkModal } from "../network/SchoolNetworkModal";

interface AdminHeaderProps {
  user: {
    fullName: string;
    role: string;
  };
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onToggleMobileSidebar,
}) => {
  const [showCronModal, setShowCronModal] = useState(false);
  const [showWhatsAppDrawer, setShowWhatsAppDrawer] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm no-print">
      {/* Left: Mobile Hamburger, Year Badge & Global Quick Search */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            title="فتح القائمة الرئيسية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black text-slate-800">2024-2025</span>
        </div>

        {/* Global Fast Command & Search Bar */}
        <GlobalCommandPalette />
      </div>

      {/* Right: Offline Sync Status, WhatsApp Drawer, Cron & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Offline Network & Sync Control */}
        <OfflineStatusBar />

        {/* Wi-Fi School Hub & QR Access */}
        <button
          onClick={() => setShowNetworkModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors border border-indigo-200 shadow-sm"
          title="بث شبكة واي فاي المدرسة ورمز QR لهواتف المعلمين"
        >
          <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span className="hidden sm:inline">واي فاي المدرسة (LAN)</span>
        </button>

        {/* WhatsApp Queue Button */}
        <button
          onClick={() => setShowWhatsAppDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors border border-emerald-200 shadow-sm"
          title="عرض طابور رسائل واتساب التلقائية"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">طابور واتساب</span>
        </button>

        {/* Cron Simulator Trigger */}
        <button
          onClick={() => setShowCronModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors border border-slate-200 shadow-sm"
          title="تشغيل وتجربة المهام المجدولة"
        >
          <Clock className="w-4 h-4 text-slate-600" />
          <span className="hidden md:inline">مشغل المهام (Cron)</span>
        </button>

        {/* Notification Center */}
        <NotificationBellDropdown />

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 border-r border-slate-200">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm">
            {user?.fullName ? user.fullName.slice(0, 1) : "م"}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">
              {user?.fullName || "مدير النظام"}
            </p>
            <span className="text-[10px] font-semibold text-slate-500">مدير النظام</span>
          </div>
          <button
            onClick={() => logoutAction()}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SchoolNetworkModal isOpen={showNetworkModal} onClose={() => setShowNetworkModal(false)} />
      <CronSimulatorModal isOpen={showCronModal} onClose={() => setShowCronModal(false)} />
      <WhatsAppQueueDrawer isOpen={showWhatsAppDrawer} onClose={() => setShowWhatsAppDrawer(false)} />
    </header>
  );
};
