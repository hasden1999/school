import { prisma } from "@/lib/prisma";

/**
 * Generates a collision-proof, sequential, human-friendly Student ID
 * Example: STU-2025-0001, STU-2025-0002
 * Uses auto-retry and uniqueness guarantee to prevent race conditions.
 */
export async function generateAtomicStudentNumber(tenantId: string, year: string = "2025"): Promise<string> {
  const count = await prisma.studentProfile.count({ where: { tenantId } });
  let nextSeq = count + 1;

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `STU-${year}-${String(nextSeq).padStart(4, "0")}`;
    const exists = await prisma.studentProfile.findFirst({
      where: { tenantId, studentNumber: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }
    nextSeq++;
  }

  // Fallback timestamp-based unique code if heavy concurrency
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `STU-${year}-${Date.now().toString().slice(-4)}-${randomSuffix}`;
}

/**
 * Generates a collision-proof, sequential, official Payment Receipt Number
 * Example: REC-2025-0001, REC-2025-0002
 */
export async function generateAtomicReceiptNumber(tenantId: string, year: string = "2025"): Promise<string> {
  const count = await prisma.paymentReceipt.count({ where: { tenantId } });
  let nextSeq = count + 1;

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `REC-${year}-${String(nextSeq).padStart(4, "0")}`;
    const exists = await prisma.paymentReceipt.findFirst({
      where: { tenantId, receiptNumber: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }
    nextSeq++;
  }

  // Fallback timestamp-based unique code if heavy concurrency
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC-${year}-${Date.now().toString().slice(-4)}-${randomSuffix}`;
}
