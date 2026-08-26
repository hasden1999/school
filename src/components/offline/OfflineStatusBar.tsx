"use client";

import React, { useState } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { executeTwoWayCloudSyncAction } from "@/app/actions/cloudSyncBridgeActions";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  X,
  Sparkles,
  ArrowUpRight,
  CloudLightning,
  Check,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const OfflineStatusBar: React.FC = () => {
  const {
    isOnline,
    pendingCount,
    pendingItems,
    isSyncing,
    isCaching,
    preparationProgress,
    cachedSchool,
    lastSyncMessage,
    triggerSync,
    prepareDeviceOffline,
  } = useOfflineSync();

  const [isOpen, setIsOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncFeedback, setCloudSyncFeedback] = useState<string | null>(null);

  const handleCloudBridgeSync = async () => {
    setIsCloudSyncing(true);
    setCloudSyncFeedback(null);
    try {
      const res = await executeTwoWayCloudSyncAction();
      if (res.success && res.stats) {
        setCloudSyncFeedback(res.stats.message);
      } else {
        setCloudSyncFeedback(res.error || "تعذرت المزامنة السحابية.");
      }
    } catch (e: any) {
      setCloudSyncFeedback("خطأ في الاتصال: " + e.message);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <>
      {/* Header Inline Connection Badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
            !isOnline
              ? "bg-amber-50 text-amber-600 border-slate-200 animate-pulse"
              : pendingCount > 0
              ? "bg-white text-slate-700 border-slate-200"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
          title="حالة الاتصال والمزامنة الأوفلاين"
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>أوفلاين (بدون إنترنت)</span>
              {pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
              <span className="hidden sm:inline">متصل</span>
              {pendingCount > 0 ? (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {pendingCount} معلقة
                </span>
              ) : (
                <span className="text-[10px] text-brand-700 font-bold hidden md:inline">
                  متزامن
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Offline Status & Sync Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="card-surface shadow-pop max-w-lg w-full overflow-hidden font-cairo animate-scaleUp">
            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    !isOnline
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-brand-50 text-brand-700 border-brand-100"
                  }`}
                >
                  {!isOnline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>مركز المزامنة والعمل بدون إنترنت</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        !isOnline
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-brand-50 text-brand-700 border border-brand-100"
                      }`}
                    >
                      {!isOnline ? "وضع الأوفلاين نشط" : "متصل بالإنترنت"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    النظام يعمل محلياً بكامل طاقته في حال انقطاع الشبكة مع مزامنة تلقائية.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Feedback Alert */}
              {lastSyncMessage && (
                <div className="p-3.5 rounded-lg bg-brand-50 border border-brand-100 text-brand-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                  <span>{lastSyncMessage}</span>
                </div>
              )}

              {/* Real-time Progress Bar for Offline Preparation */}
              {isCaching && preparationProgress && (
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-800">
                    <span>{preparationProgress.currentStep}</span>
                    <span>{preparationProgress.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-indigo-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                      style={{ width: `${preparationProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Summary Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">
                    العمليات المعلقة للمزامنة
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {pendingCount} عملية
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {pendingCount > 0
                      ? "بانتظار الإرسال للسيرفر السحابي"
                      : "كافة البيانات متزامنة محلياً وسحابياً"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-bold block">
                    بيانات المدرسة المحفوظة محلياً
                  </span>
                  <span className="text-xl font-bold text-brand-800">
                    {cachedSchool ? `${cachedSchool.students?.length || 0} طالب` : "غير مخزنة"}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {cachedSchool?.lastCachedAt
                      ? `آخر تحديث: ${new Date(cachedSchool.lastCachedAt).toLocaleTimeString("ar-IQ")}`
                      : "اضغط لتنزيل وتجهيز الجهاز"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {cloudSyncFeedback && (
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold flex items-center gap-2">
                    <CloudLightning className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{cloudSyncFeedback}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={prepareDeviceOffline}
                  disabled={isCaching || !isOnline}
                  className="w-full py-3.5 px-4 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isCaching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadCloud className="w-4 h-4 text-white" />
                  )}
                  <span>تجهيز الجهاز للعمل بدون إنترنت (Download Full Offline Data)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloudBridgeSync}
                  disabled={isCloudSyncing || !isOnline}
                  className="w-full py-3 px-4 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 text-slate-700 font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isCloudSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudLightning className="w-4 h-4 text-amber-500" />
                  )}
                  <span>مزامنة السيرفر السحابي ثنائياً (Two-Way Cloud Sync)</span>
                </button>

                <button
                  type="button"
                  onClick={triggerSync}
                  disabled={isSyncing || !isOnline || pendingCount === 0}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>مزامنة العمليات المعلقة الآن ({pendingCount})</span>
                </button>
              </div>

              {/* Pending Operations List preview if any */}
              {pendingItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    قائمة العمليات المسجلة أوفلاين بانتظار المزامنة:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {pendingItems.map((item) => (
                      <div
                        key={item.operationId}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {item.entity === "ATTENDANCE"
                              ? "تسجيل حضور وغياب"
                              : item.entity === "GRADE"
                              ? "رصد درجات مرحلية"
                              : item.entity === "PAYMENT"
                              ? "سند قبض مالي"
                              : item.entity === "STUDENT"
                              ? "إضافة طالب جديد"
                              : "عملية محلية"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString("ar-IQ")}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            item.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800 animate-pulse"
                              : item.status === "FAILED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status === "PROCESSING"
                            ? "قيد المزامنة..."
                            : item.status === "FAILED"
                            ? "فشلت المحاولة"
                            : "معلق"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>المزامنة تعمل آلياً في الخلفية فور التقاط الإنترنت.</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-slate-700 hover:text-slate-900"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
