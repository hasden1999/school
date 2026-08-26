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
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 no-print">
      {/* Left: Mobile Hamburger & Prominent School Brand Banner */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="فتح القائمة الرئيسية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Prominent Institutional School Brand Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                مدرسة المعالي الأهلية الابتدائية المختلطة
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/70 shrink-0">
                تأسست سنة 2017
              </span>
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold block">
              المنظومة الإدارية والتربوية المعتمدة
            </span>
          </div>
          <div className="sm:hidden">
            <span className="text-xs font-bold text-slate-900 block leading-tight">مدرسة المعالي</span>
            <span className="text-[9px] font-bold text-amber-800">تأسست 2017</span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-slate-700 tabular-nums">2024-2025</span>
          <span className="text-[10px] text-slate-400 font-medium">العام الدراسي</span>
        </div>

        {/* Global Fast Command & Search Bar */}
        <div className="hidden lg:block">
          <GlobalCommandPalette />
        </div>
      </div>

      {/* Right: Offline Sync Status, WhatsApp Drawer, Cron & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Offline Network & Sync Control */}
        <OfflineStatusBar />

        {/* Wi-Fi School Hub & QR Access */}
        <button
          onClick={() => setShowNetworkModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs transition-colors border border-transparent hover:border-slate-200"
          title="بث شبكة واي فاي المدرسة ورمز QR لهواتف المعلمين"
        >
          <Radio className="w-4 h-4 text-slate-400" />
          <span className="hidden xl:inline">واي فاي المدرسة (LAN)</span>
        </button>

        {/* WhatsApp Queue Button */}
        <button
          onClick={() => setShowWhatsAppDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs transition-colors border border-transparent hover:border-slate-200"
          title="عرض طابور رسائل واتساب التلقائية"
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="hidden xl:inline">طابور واتساب</span>
        </button>

        {/* Cron Simulator Trigger */}
        <button
          onClick={() => setShowCronModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs transition-colors border border-transparent hover:border-slate-200"
          title="تشغيل وتجربة المهام المجدولة"
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="hidden xl:inline">مشغل المهام (Cron)</span>
        </button>

        {/* Notification Center */}
        <NotificationBellDropdown />

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2.5 pr-2 sm:pr-3 border-r border-slate-200 mr-1">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.fullName ? user.fullName.slice(0, 1) : "م"}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">
              {user?.fullName || "المستخدم"}
            </p>
            <span className="text-[10px] font-medium text-slate-500">
              {user?.jobTitle || (user?.role === "ADMIN" ? "مدير المدرسة" : user?.role || "مستخدم")}
            </span>
          </div>
          <button
            onClick={() => logoutAction()}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
