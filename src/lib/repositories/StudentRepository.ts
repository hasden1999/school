import {
  getAllRecords,
  getRecordById,
  putRecord,
  putRecordsBatch,
  enqueueSync,
  getOfflineSession,
} from "@/lib/offline/offlineDB";
import { registerStudentAction } from "@/app/actions/studentActions";

export class StudentRepository {
  /**
   * Fetch all active students (Online first with IndexedDB fallback and local cache update)
   */
  static async getStudents(tenantId?: string): Promise<any[]> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;

    if (isOnline) {
      try {
        const { getSchoolCache } = await import("@/lib/offline/offlineDB");
        const cached = await getSchoolCache(tenantId);
        if (cached?.students && cached.students.length > 0) {
          // Asynchronously refresh and return fast
          return cached.students;
        }
      } catch (err) {
        console.warn("Could not read local cache, reading from store:", err);
      }
    }

    // Read directly from granular IndexedDB store
    const localStudents = await getAllRecords<any>("students", tenantId);
    return localStudents;
  }

  /**
   * Get single student by ID
   */
  static async getStudentById(id: string): Promise<any | null> {
    const student = await getRecordById<any>("students", id);
    return student;
  }

  /**
   * Search students offline or online
   */
  static async searchStudents(query: string, classRoomId?: string): Promise<any[]> {
    const all = await this.getStudents();
    const cleanQuery = (query || "").trim().toLowerCase();

    return all.filter((s) => {
      const matchName = s.user?.fullName?.toLowerCase().includes(cleanQuery);
      const matchCode = s.studentNumber?.toLowerCase().includes(cleanQuery);
      const matchPhone = s.guardianPhone?.includes(cleanQuery);
      const matchClass = !classRoomId || classRoomId === "ALL" || s.classRoomId === classRoomId;

      return (matchName || matchCode || matchPhone) && matchClass;
    });
  }

  /**
   * Create student with immediate local write & outbox queue
   */
  static async createStudent(formData: {
    fullName: string;
    guardianName: string;
    guardianPhone: string;
    classRoomId: string;
    sectionId: string;
    totalTuition: number;
    depositAmount: number;
    paymentMethod: string;
    depositNotes?: string;
  }): Promise<{ success: boolean; student?: any; error?: string }> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;
    const session = await getOfflineSession();
    const tenantId = session?.tenantId || "default";
    const userId = session?.id || "admin";

    const operationId = `op_stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const studentId = `stu_local_${Date.now()}`;
    const userLocalId = `user_local_${Date.now()}`;

    // 1. Optimistic Local Record
    const localRecord = {
      id: studentId,
      tenantId,
      userId: userLocalId,
      classRoomId: formData.classRoomId,
      sectionId: formData.sectionId,
      studentNumber: `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      guardianName: formData.guardianName,
      guardianPhone: formData.guardianPhone,
      totalTuition: Number(formData.totalTuition),
      depositAmount: Number(formData.depositAmount),
      registrationStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: userLocalId,
        fullName: formData.fullName,
        username: `student_${Date.now().toString().slice(-4)}`,
        role: "STUDENT",
      },
      classRoom: { id: formData.classRoomId, name: "الصف المحدد" },
      section: { id: formData.sectionId, name: "الشعبة" },
      paymentReceipts: formData.depositAmount > 0 ? [
        {
          id: `rcp_dep_${Date.now()}`,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          amount: Number(formData.depositAmount),
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: formData.paymentMethod,
          notes: formData.depositNotes || "عربون تسجيل أولي",
        }
      ] : [],
      gradeRecords: [],
      documents: [],
    };

    // Save to IndexedDB immediately (0ms UI latency)
    await putRecord("students", localRecord);

    // If Online, attempt immediate server creation
    if (isOnline) {
      try {
        const res: any = await registerStudentAction(formData as any);
        if (res.success && res.profile) {
          const fullStudent = {
            ...res.profile,
            user: res.user,
          };
          // Replace temporary local ID with server verified record
          await putRecord("students", fullStudent);
          return { success: true, student: fullStudent };
        }
      } catch (err) {
        console.warn("Online register failed, enqueuing for background sync:", err);
      }
    }

    // 2. Offline / Fallback: Enqueue for sync
    await enqueueSync("STUDENT", "CREATE", { ...formData, operationId, studentId }, tenantId, userId);

    return {
      success: true,
      student: localRecord,
    };
  }
}
