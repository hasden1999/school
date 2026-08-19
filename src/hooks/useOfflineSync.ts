"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPendingSyncItems,
  removeSyncItem,
  updateSyncItemStatus,
  saveSchoolCache,
  getSchoolCache,
  CachedSchoolBundle,
  SyncQueueItem,
} from "@/lib/offline/offlineDB";
import {
  fetchSchoolOfflineBundleAction,
  syncOfflineBatchAction,
} from "@/app/actions/syncActions";
import { SchoolRepository, PreparationProgress } from "@/lib/repositories/SchoolRepository";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [preparationProgress, setPreparationProgress] = useState<PreparationProgress | null>(null);
  const [cachedSchool, setCachedSchool] = useState<CachedSchoolBundle | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  // Refresh pending items count from IndexedDB
  const refreshPendingQueue = useCallback(async () => {
    try {
      const items = await getPendingSyncItems();
      setPendingItems(items);
      setPendingCount(items.length);
    } catch {
      // Ignore during SSR
    }
  }, []);

  // Fetch cached school from local DB
  const refreshCachedSchool = useCallback(async () => {
    try {
      const data = await getSchoolCache();
      setCachedSchool(data);
    } catch {
      // Ignore
    }
  }, []);

  // Auto-sync pending items to cloud with Idempotency & Status Transitions
  const triggerSync = useCallback(async () => {
    if (isSyncing || typeof window === "undefined" || !navigator.onLine) return;

    try {
      setIsSyncing(true);
      const items = await getPendingSyncItems();
      if (items.length === 0) {
        setLastSyncMessage("كافة البيانات متزامنة، لا توجد عمليات معلقة.");
        return;
      }

      // Mark items as PROCESSING
      for (const it of items) {
        await updateSyncItemStatus(it.operationId, "PROCESSING");
      }

      const res = await syncOfflineBatchAction(items);
      if (res.success && res.processedIds?.length > 0) {
        for (const id of res.processedIds) {
          await removeSyncItem(id);
        }
        await refreshPendingQueue();
        setLastSyncMessage(`تمت مزامنة ${res.syncedCount} عملية بنجاح مع السيرفر السحابي! 🚀`);
      } else if (res.errors && res.errors.length > 0) {
        for (const it of items) {
          await updateSyncItemStatus(it.operationId, "FAILED", res.errors[0]);
        }
        await refreshPendingQueue();
        setLastSyncMessage(`تنبيه: فشلت مزامنة ${res.failedCount} عملية. ستتم إعادة المحاولة آلياً.`);
      }
    } catch (e: any) {
      console.error("Offline sync error:", e);
      setLastSyncMessage("تعذرت المزامنة: " + (e.message || "خطأ في الاتصال"));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingQueue]);

  // Execute full device preparation ("تجهيز الجهاز للعمل بدون إنترنت")
  const prepareDeviceOffline = useCallback(async () => {
    if (isCaching || typeof window === "undefined" || !navigator.onLine) return;

    setIsCaching(true);
    try {
      const res = await SchoolRepository.prepareOfflineDeviceData((prog) => {
        setPreparationProgress(prog);
      });

      if (res.success) {
        await refreshCachedSchool();
        setLastSyncMessage("تم بنجاح تحميل وحفظ نسخة بيانات المدرسة للعمل بدون إنترنت! 💾");
      } else {
        setLastSyncMessage("فشل تجهيز الجهاز: " + (res.error || "خطأ غير متوقع"));
      }
    } catch (e: any) {
      setLastSyncMessage("فشل التجهيز: " + e.message);
    } finally {
      setIsCaching(false);
    }
  }, [isCaching, refreshCachedSchool]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshPendingQueue();
    refreshCachedSchool();

    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check every 20 seconds
    const interval = setInterval(() => {
      refreshPendingQueue();
      if (navigator.onLine && pendingCount > 0) {
        triggerSync();
      }
    }, 20000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [triggerSync, refreshPendingQueue, refreshCachedSchool, pendingCount]);

  return {
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
    cacheSchoolData: prepareDeviceOffline,
    refreshPendingQueue,
  };
}
