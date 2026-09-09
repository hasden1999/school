import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isPrismaInitialized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Always maintain singleton across all environments (including Next.js hot-reloads)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Configure SQLite busy_timeout once per process lifetime safely to wait for file locks
if (!globalForPrisma.isPrismaInitialized) {
  globalForPrisma.isPrismaInitialized = true;
  prisma.$queryRawUnsafe(`PRAGMA busy_timeout = 10000;`)
    .catch(() => {});
}
