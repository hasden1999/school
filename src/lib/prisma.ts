import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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


