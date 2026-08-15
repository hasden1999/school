"use server";

import { requireAuth } from "@/lib/auth";
import {
  run8AMLeaveResolution,
  run9AMAttendanceAudit,
  runNightlyDatabaseBackup,
  runOverdueTuitionReminders,
} from "@/lib/cronEngine";
import { revalidatePath } from "next/cache";

export async function executeCronTaskManually(taskType: "LEAVE_8AM" | "ATTENDANCE_9AM" | "BACKUP_NIGHTLY" | "OVERDUE_PAYMENTS") {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  let result;
  switch (taskType) {
    case "LEAVE_8AM":
      result = await run8AMLeaveResolution(tenantId);
      break;
    case "ATTENDANCE_9AM":
      result = await run9AMAttendanceAudit(tenantId);
      break;
    case "BACKUP_NIGHTLY":
      result = await runNightlyDatabaseBackup(tenantId, session.id);
      break;
    case "OVERDUE_PAYMENTS":
      result = await runOverdueTuitionReminders(tenantId);
      break;
    default:
      throw new Error("Invalid task type");
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leaves");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/backup");
  revalidatePath("/admin/whatsapp");
  return result;
}
