import { getAllRecords } from "@/lib/offline/offlineDB";

export class ClassroomRepository {
  /**
   * Fetch all classrooms
   */
  static async getClassrooms(tenantId?: string): Promise<any[]> {
    const list = await getAllRecords<any>("classrooms", tenantId);
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  /**
   * Fetch all sections
   */
  static async getSections(classRoomId?: string, tenantId?: string): Promise<any[]> {
    const all = await getAllRecords<any>("sections", tenantId);
    if (!classRoomId || classRoomId === "ALL") return all;
    return all.filter((s) => s.classRoomId === classRoomId);
  }

  /**
   * Fetch all subjects
   */
  static async getSubjects(tenantId?: string): Promise<any[]> {
    const list = await getAllRecords<any>("subjects", tenantId);
    return list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }
}
