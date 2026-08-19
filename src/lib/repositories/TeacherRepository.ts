import { getAllRecords } from "@/lib/offline/offlineDB";

export class TeacherRepository {
  /**
   * Fetch all teachers
   */
  static async getTeachers(tenantId?: string): Promise<any[]> {
    const list = await getAllRecords<any>("teachers", tenantId);
    return list;
  }
}
