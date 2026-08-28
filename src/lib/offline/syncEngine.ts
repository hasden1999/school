"use client";

import {
  getPendingSyncQueue,
  updateSyncQueueItemStatus,
  removeSyncQueueItem,
  saveCachedSchool,
  saveStudentsBatch,
  saveClassRoomsBatch,
  saveSectionsBatch,
  saveSubjectsBatch,
  saveTeachersBatch,
  SyncQueueItem,
} from "./offlineDB";
import { syncOfflineBatchAction, fetchSchoolOfflineBundleAction } from "@/app/actions/syncActions";

export interface SyncEngineStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastError: string | null;
}

let syncInProgress = false;
let listenersRegistered = false;

/**
 * Run full bidirectional synchronization
 */
export async function triggerManualSync(): Promise<{
  success: boolean;
  syncedCount: number;
  failedCount: number;
  message: string;
}> {
  if (typeof window === "undefined") {
    return { success: false, syncedCount: 0, failedCount: 0, message: "Browser environment required" };
  }

  if (!navigator.onLine) {
    return { success: false, syncedCount: 0, failedCount: 0, message: "لا يوجد اتصال بالإنترنت حالياً" };
  }

  if (syncInProgress) {
    return { success: false, syncedCount: 0, failedCount: 0, message: "عملية المزامنة جارية بالفعل..." };
  }

  syncInProgress = true;
  dispatchSyncStatus();

  try {
    // 1. Fetch pending outbox queue
    const pendingItems = await getPendingSyncQueue();

    let syncedCount = 0;
    let failedCount = 0;

    if (pendingItems.length > 0) {
      // Mark as processing
      for (const item of pendingItems) {
        await updateSyncQueueItemStatus(item.operationId, "PROCESSING");
      }

      // Send batch to server
      const res = await syncOfflineBatchAction(pendingItems);

      if (res.success) {
        for (const processedId of res.processedIds) {
          await removeSyncQueueItem(processedId);
        }
        syncedCount = res.syncedCount;
        failedCount = res.failedCount;
      } else {
        for (const item of pendingItems) {
          await updateSyncQueueItemStatus(item.operationId, "FAILED", res.errors.join(", "));
        }
        failedCount = pendingItems.length;
      }
    }

    // 2. Download fresh school bundle to keep local caches 100% updated
    try {
      const bundleRes = await fetchSchoolOfflineBundleAction();
      if (bundleRes.success && bundleRes.bundle) {
        await saveCachedSchool(bundleRes.bundle);
      }
    } catch (bundleErr) {
      console.warn("Could not refresh offline bundle:", bundleErr);
    }

    localStorage.setItem("school_last_synced_at", new Date().toISOString());

    return {
      success: true,
      syncedCount,
      failedCount,
      message:
        syncedCount > 0
          ? `تمت مزامنة (${syncedCount}) عملية بنجاح مع السحابة!`
          : "قاعدة البيانات المحلية متزامنة ومحدثة بالكامل مع السحابة.",
    };
  } catch (err: any) {
    console.error("Sync error:", err);
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      message: err.message || "حدث خطأ غير متوقع أثناء المزامنة",
    };
  } finally {
    syncInProgress = false;
    dispatchSyncStatus();
  }
}

/**
 * Initialize automatic background sync listeners
 */
export function initSyncEngine() {
  if (typeof window === "undefined" || listenersRegistered) return;
  listenersRegistered = true;

  // Listen for network coming online
  window.addEventListener("online", () => {
    console.log("🌐 Internet connection restored. Triggering auto-sync...");
    dispatchSyncStatus();
    triggerManualSync();
  });

  window.addEventListener("offline", () => {
    console.log("📵 Internet disconnected. Running in Local Offline Mode.");
    dispatchSyncStatus();
  });

  // Background heartbeat every 60 seconds
  setInterval(() => {
    if (navigator.onLine && !syncInProgress) {
      getPendingSyncQueue().then((items) => {
        if (items.length > 0) {
          triggerManualSync();
        }
      });
    }
  }, 60 * 1000);
}

export function dispatchSyncStatus() {
  if (typeof window === "undefined") return;
  getPendingSyncQueue().then((items) => {
    const event = new CustomEvent("school-sync-status-changed", {
      detail: {
        isOnline: navigator.onLine,
        pendingCount: items.length,
        isSyncing: syncInProgress,
        lastSyncTime: localStorage.getItem("school_last_synced_at"),
      },
    });
    window.dispatchEvent(event);
  });
}
