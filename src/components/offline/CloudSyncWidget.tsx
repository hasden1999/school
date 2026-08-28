"use client";

import React, { useState, useEffect } from "react";
import { triggerManualSync, initSyncEngine } from "@/lib/offline/syncEngine";
import { getPendingSyncQueue } from "@/lib/offline/offlineDB";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const CloudSyncWidget: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    initSyncEngine();

    // Initial check
    setIsOnline(navigator.onLine);
    getPendingSyncQueue().then((items) => setPendingCount(items.length));
    setLastSyncTime(localStorage.getItem("school_last_synced_at"));

    const handleSyncStatus = (e: any) => {
      if (e.detail) {
        setIsOnline(e.detail.isOnline);
        setPendingCount(e.detail.pendingCount);
        setIsSyncing(e.detail.isSyncing);
        setLastSyncTime(e.detail.lastSyncTime);
      }
    };

    window.addEventListener("school-sync-status-changed", handleSyncStatus);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener("school-sync-status-changed", handleSyncStatus);
    };
  }, []);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setNotification(null);
    try {
      const res = await triggerManualSync();
      setNotification(res.message);
      getPendingSyncQueue().then((items) => setPendingCount(items.length));
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification(err.message || "خطأ أثناء المزامنة");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 font-cairo">
      {/* Visual Sync Badge */}
      <button
        type="button"
        onClick={handleSyncClick}
        disabled={isSyncing || !isOnline}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border ${
          !isOnline
            ? "bg-amber-50 text-amber-800 border-amber-200 cursor-default"
            : pendingCount > 0
            ? "bg-amber-500 text-slate-950 border-amber-600 animate-pulse hover:bg-amber-400 cursor-pointer"
            : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
        }`}
        title={
          !isOnline
            ? "المنظومة تعمل محلياً بدون إنترنت بأمان تام"
            : pendingCount > 0
            ? `توجد ${pendingCount} عمليات محفوظة محلياً - اضغط للمزامنة مع السحابة`
            : "البيانات متزامنة ومحدثة بالكامل مع السحابة"
        }
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-800" />
            <span className="hidden sm:inline">جاري المزامنة...</span>
          </>
        ) : !isOnline ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-700" />
            <span>محلي (أوفلاين)</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>مزامنة ({pendingCount})</span>
          </>
        ) : (
          <>
            <Cloud className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">السحابة متزامنة 🟢</span>
          </>
        )}
      </button>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-scaleUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
