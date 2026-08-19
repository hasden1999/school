"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SubscriptionBanner } from "../billing/SubscriptionBanner";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: any;
  schoolName?: string;
  tenant?: any;
}

export const AdminLayoutClient: React.FC<AdminLayoutClientProps> = ({
  children,
  user,
  schoolName,
  tenant,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-cairo text-slate-900 overflow-x-hidden">
      {/* Sidebar with responsive Desktop + Mobile Drawer support */}
      <AdminSidebar
        schoolName={schoolName}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <SubscriptionBanner tenant={tenant} />
        <AdminHeader
          user={user}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
