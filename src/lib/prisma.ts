import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Configure SQLite WAL mode for high-concurrency multi-user reliability
if (process.env.NODE_ENV !== "production" || !globalForPrisma.prisma) {
  prisma.$queryRawUnsafe(`PRAGMA journal_mode = WAL;`)
    .then(() => prisma.$queryRawUnsafe(`PRAGMA synchronous = NORMAL;`))
    .then(() => prisma.$queryRawUnsafe(`PRAGMA busy_timeout = 5000;`))
    .catch(() => {});
}

// Always maintain singleton across all environments
globalForPrisma.prisma = prisma;
