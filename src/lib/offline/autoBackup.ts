import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "prisma", "school_local.db");
const BACKUPS_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUP_FILES = 14; // Keep 14 days of automatic backups

/**
 * Creates an automated silent snapshot of the local SQLite database.
 */
export async function runAutoBackup(): Promise<{ success: boolean; backupFile?: string; error?: string }> {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { success: false, error: "قاعدة البيانات المحلية غير موجودة" };
    }

    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const backupFileName = `school_backup_${today}.db`;
    const targetPath = path.join(BACKUPS_DIR, backupFileName);

    // Copy DB file with metadata
    fs.copyFileSync(DB_PATH, targetPath);

    // Clean up old backups exceeding MAX_BACKUP_FILES
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith("school_backup_") && f.endsWith(".db"))
      .sort();

    if (files.length > MAX_BACKUP_FILES) {
      const filesToRemove = files.slice(0, files.length - MAX_BACKUP_FILES);
      for (const f of filesToRemove) {
        try {
          fs.unlinkSync(path.join(BACKUPS_DIR, f));
        } catch {}
      }
    }

    return { success: true, backupFile: backupFileName };
  } catch (err: any) {
    console.error("Auto backup error:", err);
    return { success: false, error: err.message || "فشل إنشاء النسخة الاحتياطية التلقائية" };
  }
}
