import {
  putRecord,
  getAllRecords,
  enqueueSync,
  getOfflineSession,
} from "@/lib/offline/offlineDB";
import { savePhaseGradesAction, togglePhaseLockAction } from "@/app/actions/gradeActions";

export class GradeRepository {
  /**
   * Fetch grades for a specific classroom and subject
   */
  static async getClassGrades(classRoomId: string, subjectId: string): Promise<any[]> {
    // Read local students for this classroom
    const allStudents = await getAllRecords<any>("students");
    const classStudents = allStudents.filter((s) => s.classRoomId === classRoomId);

    // Read local grades
    const allGrades = await getAllRecords<any>("grades");
    const subjectGrades = allGrades.filter(
      (g) => g.classRoomId === classRoomId && g.subjectId === subjectId
    );

    const gradeMap = new Map<string, any>();
    for (const g of subjectGrades) {
      if (g.items) {
        for (const item of g.items) {
          gradeMap.set(item.studentId, item.score);
        }
      }
    }

    return classStudents.map((s) => ({
      ...s,
      currentScore: gradeMap.get(s.id) ?? null,
    }));
  }

  /**
   * Save phase grades with optimistic local write & outbox queue
   */
  static async savePhaseGrades(
    classRoomId: string,
    subjectId: string,
    phase: string,
    grades: Array<{ studentId: string; score: number | null }>
  ): Promise<{ success: boolean; error?: string }> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;
    const session = await getOfflineSession();
    const tenantId = session?.tenantId || "default";
    const userId = session?.id || "admin";

    const operationId = `op_grd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const localKey = `${classRoomId}_${subjectId}_${phase}`;

    const localData = {
      id: localKey,
      localKey,
      tenantId,
      classRoomId,
      subjectId,
      phase,
      items: grades,
      savedAt: new Date().toISOString(),
    };

    // 1. Optimistic immediate local write (0ms)
    await putRecord("grades", localData);
    await putRecord("gradesLocal", localData);

    // 2. If Online, attempt immediate server submission
    if (isOnline) {
      try {
        const res = await savePhaseGradesAction({
          classRoomId,
          subjectId,
          phase: phase as any,
          grades,
        });
        if (res.success) {
          return { success: true };
        }
      } catch (err) {
        console.warn("Online grade save failed, enqueuing for background sync:", err);
      }
    }

    // 3. Enqueue for background sync
    await enqueueSync("GRADE", "CREATE", { ...localData, operationId }, tenantId, userId);

    return { success: true };
  }

  /**
   * Lock/Unlock exam phase
   */
  static async togglePhaseLock(
    classRoomId: string,
    subjectId: string,
    phase: string,
    lock: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

    if (isOnline) {
      try {
        await togglePhaseLockAction({
          classRoomId,
          subjectId,
          phase: phase as any,
          lock,
          notifyWhatsApp: lock,
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }
}
