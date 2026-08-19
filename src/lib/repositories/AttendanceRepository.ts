import {
  putRecord,
  getAllRecords,
  enqueueSync,
  getOfflineSession,
} from "@/lib/offline/offlineDB";
import { submitAttendanceAction, getClassAttendanceData } from "@/app/actions/attendanceActions";

export class AttendanceRepository {
  /**
   * Fetch attendance roster for a specific classroom, section and date
   */
  static async getClassAttendance(
    classRoomId: string,
    sectionId: string,
    dateStr: string
  ): Promise<any[]> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

    if (isOnline) {
      try {
        const serverRoster = await getClassAttendanceData({
          classRoomId,
          sectionId,
          dateStr,
        });
        if (serverRoster && serverRoster.length > 0) {
          return serverRoster;
        }
      } catch (err) {
        console.warn("Online attendance fetch failed, falling back to local storage:", err);
      }
    }

    // Fallback: Read local students for this classroom & section
    const allStudents = await getAllRecords<any>("students");
    const classStudents = allStudents.filter(
      (s) => s.classRoomId === classRoomId && (!sectionId || s.sectionId === sectionId)
    );

    // Read local attendance records for this date
    const allAttendance = await getAllRecords<any>("attendance");
    const localDayRecord = allAttendance.find(
      (a) => a.classRoomId === classRoomId && a.sectionId === sectionId && a.date === dateStr
    );

    const statusMap = new Map<string, any>();
    if (localDayRecord?.records) {
      for (const r of localDayRecord.records) {
        statusMap.set(r.studentId, r);
      }
    }

    return classStudents.map((s) => {
      const existing = statusMap.get(s.id);
      return {
        ...s,
        attendanceRecords: existing
          ? [{ status: existing.status, notes: existing.notes || "", date: dateStr }]
          : [],
      };
    });
  }

  /**
   * Save and submit attendance with optimistic local write & outbox queue
   */
  static async saveAttendance(
    classRoomId: string,
    sectionId: string,
    dateStr: string,
    records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "ON_LEAVE" | "LATE" | any; notes?: string }>
  ): Promise<{ success: boolean; error?: string }> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;
    const session = await getOfflineSession();
    const tenantId = session?.tenantId || "default";
    const userId = session?.id || "admin";

    const operationId = `op_att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const localKey = `${classRoomId}_${sectionId}_${dateStr}`;

    const localData = {
      id: localKey,
      localKey,
      tenantId,
      classRoomId,
      sectionId,
      date: dateStr,
      records,
      savedAt: new Date().toISOString(),
    };

    // 1. Optimistic immediate local write (0ms)
    await putRecord("attendance", localData);
    await putRecord("attendanceLocal", localData);

    // 2. If Online, attempt immediate server submission
    if (isOnline) {
      try {
        const res = await submitAttendanceAction({
          classRoomId,
          sectionId,
          dateStr,
          records: records as any,
        });
        if (res.success) {
          return { success: true };
        }
      } catch (err) {
        console.warn("Online submit failed, enqueuing for background sync:", err);
      }
    }

    // 3. Enqueue for background sync
    await enqueueSync("ATTENDANCE", "CREATE", { ...localData, operationId }, tenantId, userId);

    return { success: true };
  }
}
