import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Pooled connection string for the running app. Accepts Neon/Vercel integration
 * names and strips quotes accidentally pasted into hosting dashboards.
 * (DIRECT_URL is only needed by migrations, see scripts/vercel-build.mjs.)
 */
function resolveDatabaseUrl(): string | undefined {
  for (const name of ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"]) {
    const value = process.env[name]?.trim().replace(/^["']+|["']+$/g, "").trim();
    if (value) return value;
  }
  return undefined;
}

// Reuse one client across hot reloads in development to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  // Query errors are logged by `handleError` (lib/http.ts) only when unexpected,
  // so Prisma's own error logging is disabled to avoid noise for 404/409 cases.
  new PrismaClient({ log: ["warn"], datasourceUrl: resolveDatabaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
