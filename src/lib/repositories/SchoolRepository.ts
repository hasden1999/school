import {
  saveSchoolCache,
  getSchoolCache,
  saveOfflineSession,
  getOfflineSession,
  getAllRecords,
  CachedSchoolBundle,
} from "@/lib/offline/offlineDB";
import { fetchSchoolOfflineBundleAction } from "@/app/actions/syncActions";

export interface PreparationProgress {
  status: "STARTING" | "DOWNLOADING" | "SAVING" | "CACHING_PAGES" | "COMPLETED" | "ERROR";
  progressPercent: number;
  currentStep: string;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  cachedAt?: string;
  error?: string;
}

const ADMIN_ROUTES_TO_PRECACHE = [
  "/admin",
  "/admin/dashboard",
  "/admin/students",
  "/admin/attendance",
  "/admin/grades",
  "/admin/payments",
  "/admin/teachers",
  "/admin/schedule",
];

export class SchoolRepository {
  /**
   * Check if the device is offline-ready (has cached school data)
   */
  static async isDeviceOfflineReady(tenantId?: string): Promise<boolean> {
    const cache = await getSchoolCache(tenantId);
    return !!(cache && cache.students && cache.students.length > 0);
  }

  /**
   * Execute comprehensive initial download ("تجهيز الجهاز للعمل بدون إنترنت لعدة أيام/أسابيع")
   */
  static async prepareOfflineDeviceData(
    onProgress?: (progress: PreparationProgress) => void
  ): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      onProgress?.({
        status: "STARTING",
        progressPercent: 5,
        currentStep: "تأمين مساحة التخزين الدائمة والتحقق من الصلاحيات...",
        totalStudents: 0,
        totalTeachers: 0,
        totalClassrooms: 0,
      });

      // 1. Request persistent storage from browser (prevents clearing data after days)
      if (typeof window !== "undefined" && navigator.storage && navigator.storage.persist) {
        try {
          await navigator.storage.persist();
        } catch {
          // Continue even if browser doesn't support persist
        }
      }

      // 2. Fetch complete bundle from server action
      onProgress?.({
        status: "DOWNLOADING",
        progressPercent: 25,
        currentStep: "جلب سجلات المدرسة والصفوف والطلاب والمعلمين من السيرفر...",
        totalStudents: 0,
        totalTeachers: 0,
        totalClassrooms: 0,
      });

      const res: any = await fetchSchoolOfflineBundleAction();
      if (!res.success || !res.bundle) {
        throw new Error(res.error || "فشل استلام حزمة بيانات المدرسة من السيرفر السحابي");
      }

      const bundle = res.bundle as CachedSchoolBundle;

      // 3. Save master bundle and populate granular IndexedDB stores
      onProgress?.({
        status: "SAVING",
        progressPercent: 60,
        currentStep: "حفظ وفهرسة السجلات محلياً في قاعدة البيانات على الجهاز...",
        totalStudents: bundle.students?.length || 0,
        totalTeachers: bundle.teachers?.length || 0,
        totalClassrooms: bundle.classRooms?.length || 0,
      });

      await saveSchoolCache(bundle);

      // 4. Save offline session snapshot (30 days validity for multi-day offline)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      await saveOfflineSession({
        id: "active_user",
        tenantId: bundle.tenantId,
        username: "admin",
        fullName: "مدير النظام",
        role: "ADMIN",
        schoolName: bundle.schoolName,
        savedAt: new Date().toISOString(),
        expiresAt: expiry.toISOString(),
      });

      // 5. Pre-cache all admin pages HTML and assets in Service Worker CacheStorage
      onProgress?.({
        status: "CACHING_PAGES",
        progressPercent: 85,
        currentStep: "تخزين واجهات وصفحات النظام لتعمل بدون متصفح وسيرفر...",
        totalStudents: bundle.students?.length || 0,
        totalTeachers: bundle.teachers?.length || 0,
        totalClassrooms: bundle.classRooms?.length || 0,
      });

      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cache = await caches.open("nukhba-shell-v5");
          await Promise.all(
            ADMIN_ROUTES_TO_PRECACHE.map(async (route) => {
              try {
                const pageRes = await fetch(route);
                if (pageRes.ok) {
                  await cache.put(route, pageRes);
                }
              } catch {
                // Ignore single route failure
              }
            })
          );
        } catch (cErr) {
          console.warn("Failed to pre-cache routes into CacheStorage:", cErr);
        }

        // Notify Service Worker as well
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "PRECACHE_ALL_ROUTES",
          });
        }
      }

      onProgress?.({
        status: "COMPLETED",
        progressPercent: 100,
        currentStep: "اكتمل التجهيز! النظام جاهز للعمل بدون إنترنت لعدة أيام وأسابيع 🚀",
        totalStudents: bundle.students?.length || 0,
        totalTeachers: bundle.teachers?.length || 0,
        totalClassrooms: bundle.classRooms?.length || 0,
        cachedAt: bundle.lastCachedAt,
      });

      return {
        success: true,
        stats: {
          totalStudents: bundle.students?.length || 0,
          totalTeachers: bundle.teachers?.length || 0,
          totalClassrooms: bundle.classRooms?.length || 0,
          cachedAt: bundle.lastCachedAt,
        },
      };
    } catch (e: any) {
      onProgress?.({
        status: "ERROR",
        progressPercent: 0,
        currentStep: "فشل التجهيز",
        totalStudents: 0,
        totalTeachers: 0,
        totalClassrooms: 0,
        error: e.message,
      });
      return { success: false, error: e.message };
    }
  }

  /**
   * Get cached school metadata
   */
  static async getSchoolInfo(): Promise<any | null> {
    const bundle = await getSchoolCache();
    if (!bundle) return null;
    return {
      tenantId: bundle.tenantId,
      name: bundle.schoolName,
      type: bundle.schoolType,
      currency: bundle.currency,
      lastCachedAt: bundle.lastCachedAt,
    };
  }
}
