/**
 * Multi-Store IndexedDB Engine for Nukhba School SaaS (Offline-First)
 * Stores master school data, granular entity stores, offline session, and outbox sync queue.
 */

const DB_NAME = "NukhbaSchoolOfflineDB_v3";
const DB_VERSION = 1;

export interface SyncQueueItem {
  operationId: string;
  tenantId: string;
  userId: string;
  entity: "STUDENT" | "ATTENDANCE" | "GRADE" | "PAYMENT" | "TEACHER" | "SCHEDULE";
  operation: "CREATE" | "UPDATE" | "DELETE";
  payload: any;
  timestamp: string;
  status: "PENDING" | "PROCESSING" | "SYNCED" | "FAILED";
  retryCount: number;
  lastError?: string;
}

export interface OfflineSession {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  role: string;
  phone?: string;
  schoolName?: string;
  savedAt: string;
  expiresAt?: string; // ISO string - 30 days from savedAt
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;

      // 1. Master School Cache
      if (!db.objectStoreNames.contains("cachedSchool")) {
        db.createObjectStore("cachedSchool", { keyPath: "tenantId" });
      }

      // 2. Offline Auth Session
      if (!db.objectStoreNames.contains("offlineSession")) {
        db.createObjectStore("offlineSession", { keyPath: "id" });
      }

      // 3. Outbox Sync Queue
      if (!db.objectStoreNames.contains("syncQueue")) {
        const queueStore = db.createObjectStore("syncQueue", { keyPath: "operationId" });
        queueStore.createIndex("status", "status", { unique: false });
        queueStore.createIndex("timestamp", "timestamp", { unique: false });
        queueStore.createIndex("tenantId", "tenantId", { unique: false });
        queueStore.createIndex("entity", "entity", { unique: false });
      }

      // 4. Students Store
      if (!db.objectStoreNames.contains("students")) {
        const store = db.createObjectStore("students", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("classRoomId", "classRoomId", { unique: false });
        store.createIndex("sectionId", "sectionId", { unique: false });
        store.createIndex("studentNumber", "studentNumber", { unique: false });
      }

      // 5. Teachers Store
      if (!db.objectStoreNames.contains("teachers")) {
        const store = db.createObjectStore("teachers", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("role", "role", { unique: false });
      }

      // 6. ClassRooms Store
      if (!db.objectStoreNames.contains("classrooms")) {
        const store = db.createObjectStore("classrooms", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("orderIndex", "orderIndex", { unique: false });
      }

      // 7. Sections Store
      if (!db.objectStoreNames.contains("sections")) {
        const store = db.createObjectStore("sections", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("classRoomId", "classRoomId", { unique: false });
      }

      // 8. Subjects Store
      if (!db.objectStoreNames.contains("subjects")) {
        const store = db.createObjectStore("subjects", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("orderIndex", "orderIndex", { unique: false });
      }

      // 9. Attendance Store
      if (!db.objectStoreNames.contains("attendance")) {
        const store = db.createObjectStore("attendance", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("studentId", "studentId", { unique: false });
        store.createIndex("classSectionDate", ["classRoomId", "sectionId", "date"], { unique: false });
      }

      // 10. Grades Store
      if (!db.objectStoreNames.contains("grades")) {
        const store = db.createObjectStore("grades", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("studentId", "studentId", { unique: false });
        store.createIndex("subjectId", "subjectId", { unique: false });
        store.createIndex("classRoomId", "classRoomId", { unique: false });
      }

      // 11. Payments Store
      if (!db.objectStoreNames.contains("payments")) {
        const store = db.createObjectStore("payments", { keyPath: "id" });
        store.createIndex("tenantId", "tenantId", { unique: false });
        store.createIndex("studentId", "studentId", { unique: false });
        store.createIndex("receiptNumber", "receiptNumber", { unique: false });
        store.createIndex("paymentDate", "paymentDate", { unique: false });
      }

      // 12. Legacy stores for backward-compatibility
      if (!db.objectStoreNames.contains("attendanceLocal")) {
        db.createObjectStore("attendanceLocal", { keyPath: "localKey" });
      }
      if (!db.objectStoreNames.contains("gradesLocal")) {
        db.createObjectStore("gradesLocal", { keyPath: "localKey" });
      }
      if (!db.objectStoreNames.contains("paymentsLocal")) {
        db.createObjectStore("paymentsLocal", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// GENERIC INDEXEDDB HELPERS
// -------------------------------------------------------------

export async function putRecord<T>(storeName: string, record: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function putRecordsBatch<T>(storeName: string, records: T[]): Promise<void> {
  if (!records || records.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const rec of records) {
      store.put(rec);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecordById<T>(storeName: string, id: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function getAllRecords<T>(storeName: string, tenantId?: string): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      if (tenantId && store.indexNames.contains("tenantId")) {
        const index = store.index("tenantId");
        const req = index.getAll(tenantId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } else {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      }
    });
  } catch {
    return [];
  }
}

export async function deleteRecord(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// OFFLINE AUTH SESSION
// -------------------------------------------------------------

export async function saveOfflineSession(session: OfflineSession): Promise<void> {
  await putRecord("offlineSession", session);
}

export async function getOfflineSession(): Promise<OfflineSession | null> {
  try {
    const list = await getAllRecords<OfflineSession>("offlineSession");
    return list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}

export async function clearOfflineSession(): Promise<void> {
  await clearStore("offlineSession");
}

// -------------------------------------------------------------
// OUTBOX SYNC QUEUE WITH IDEMPOTENCY
// -------------------------------------------------------------

export async function enqueueSync(
  entity: SyncQueueItem["entity"],
  operation: SyncQueueItem["operation"],
  payload: any,
  tenantId: string,
  userId: string
): Promise<SyncQueueItem> {
  const operationId = payload?.operationId || `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const item: SyncQueueItem = {
    operationId,
    tenantId,
    userId,
    entity,
    operation,
    payload: { ...payload, operationId },
    timestamp: new Date().toISOString(),
    status: "PENDING",
    retryCount: 0,
  };

  await putRecord("syncQueue", item);
  return item;
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("syncQueue", "readonly");
      const store = tx.objectStore("syncQueue");
      const req = store.getAll();
      req.onsuccess = () => {
        const items: SyncQueueItem[] = req.result || [];
        resolve(items.filter((i) => i.status === "PENDING" || i.status === "FAILED"));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function updateSyncItemStatus(
  operationId: string,
  status: SyncQueueItem["status"],
  error?: string
): Promise<void> {
  const item = await getRecordById<SyncQueueItem>("syncQueue", operationId);
  if (item) {
    item.status = status;
    if (status === "FAILED") {
      item.retryCount = (item.retryCount || 0) + 1;
      item.lastError = error;
    }
    await putRecord("syncQueue", item);
  }
}

export async function removeSyncItem(operationId: string): Promise<void> {
  await deleteRecord("syncQueue", operationId);
}

// -------------------------------------------------------------
// BACKWARD-COMPATIBLE HELPERS
// -------------------------------------------------------------

export interface CachedSchoolBundle {
  tenantId: string;
  schoolName: string;
  schoolType: string;
  currency: string;
  classRooms: any[];
  sections: any[];
  subjects: any[];
  students: any[];
  teachers: any[];
  lastCachedAt: string;
}

export async function saveSchoolCache(bundle: CachedSchoolBundle): Promise<void> {
  await putRecord("cachedSchool", bundle);
  // Also seed granular stores
  if (bundle.students) await putRecordsBatch("students", bundle.students);
  if (bundle.teachers) await putRecordsBatch("teachers", bundle.teachers);
  if (bundle.classRooms) await putRecordsBatch("classrooms", bundle.classRooms);
  if (bundle.sections) await putRecordsBatch("sections", bundle.sections);
  if (bundle.subjects) await putRecordsBatch("subjects", bundle.subjects);
}

export async function getSchoolCache(tenantId?: string): Promise<CachedSchoolBundle | null> {
  try {
    const list = await getAllRecords<CachedSchoolBundle>("cachedSchool", tenantId);
    return list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}

export async function saveLocalAttendance(
  classRoomId: string,
  sectionId: string,
  dateStr: string,
  records: any[],
  tenantId = "default",
  userId = "admin"
): Promise<void> {
  const localKey = `${classRoomId}_${sectionId}_${dateStr}`;
  const data = {
    id: localKey,
    localKey,
    tenantId,
    classRoomId,
    sectionId,
    date: dateStr,
    records,
    savedAt: new Date().toISOString(),
  };

  await putRecord("attendance", data);
  await putRecord("attendanceLocal", data);

  await enqueueSync("ATTENDANCE", "CREATE", data, tenantId, userId);
}

export async function saveLocalGrade(
  classRoomId: string,
  subjectId: string,
  phase: string,
  items: any[],
  tenantId = "default",
  userId = "admin"
): Promise<void> {
  const localKey = `${classRoomId}_${subjectId}_${phase}`;
  const data = {
    id: localKey,
    localKey,
    tenantId,
    classRoomId,
    subjectId,
    phase,
    items,
    savedAt: new Date().toISOString(),
  };

  await putRecord("grades", data);
  await putRecord("gradesLocal", data);

  await enqueueSync("GRADE", "CREATE", data, tenantId, userId);
}

export async function saveLocalPayment(
  receiptData: any,
  tenantId = "default",
  userId = "admin"
): Promise<void> {
  const receiptId = receiptData.id || `RCP-${Date.now()}`;
  const record = { ...receiptData, id: receiptId, tenantId };

  await putRecord("payments", record);
  await putRecord("paymentsLocal", record);

  await enqueueSync("PAYMENT", "CREATE", record, tenantId, userId);
}
