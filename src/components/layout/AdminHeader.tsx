"use client";

import React, { useState } from "react";
import { logoutAction } from "@/app/actions/authActions";
import {
  Clock,
  LogOut,
  MessageSquare,
  Menu,
  Radio,
  Building2,
  Sparkles,
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
    jobTitle?: string | null;
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
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 no-print font-cairo shadow-2xs">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 shadow-2xs"
            title="فتح القائمة الرئيسية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile-only compact School Badge */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            معالي
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">مدرسة المعالي</span>
            <span className="text-[9px] font-bold text-amber-800">تأسست 2017</span>
          </div>
        </div>

        {/* Academic Year Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-xs font-bold text-slate-700 tabular-nums">العام الدراسي 2024-2025</span>
        </div>

        {/* Global Fast Search Command Bar */}
        <div className="hidden md:block">
          <GlobalCommandPalette />
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Offline Sync Status */}
        <OfflineStatusBar />

        {/* WhatsApp Drawer Quick Trigger */}
        <button
          type="button"
          onClick={() => setShowWhatsAppDrawer(true)}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
          title="عرض طابور رسائل واتساب التلقائية"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <NotificationBellDropdown />

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 pr-2 sm:pr-3 border-r border-slate-200 mr-1">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {(user?.fullName || "م").charAt(0)}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">
              {user?.fullName || "مدير المدرسة"}
            </p>
            <span className="text-[10px] font-semibold text-emerald-800">
              {user?.role === "ADMIN" ? "المالك / المدير" : "الإدارة"}
            </span>
          </div>
          <button
            type="button"
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
