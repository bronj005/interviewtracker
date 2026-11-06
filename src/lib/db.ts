import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in development to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  // Query errors are logged by `handleError` (lib/http.ts) only when unexpected,
  // so Prisma's own error logging is disabled to avoid noise for 404/409 cases.
  new PrismaClient({ log: ["warn"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
