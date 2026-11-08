import "server-only";
import { prisma } from "@/lib/db";
import { addMetrics, emptyMetrics, metricsFromSums } from "@/lib/metrics";
import { listProfiles } from "@/server/profiles";
import type { MetricValues, ProfileWithTotals } from "@/types";

const sumFields = { calls: true, round1: true, round2: true, round3: true } as const;

export interface StatsData {
  totals: MetricValues;
  profiles: ProfileWithTotals[];
  daily: { date: string; values: MetricValues }[];
}

/** Earliest day with any record, or null when the database is empty. */
export async function getFirstRecordedDate(): Promise<string | null> {
  const row = await prisma.dailyCount.findFirst({ orderBy: { date: "asc" }, select: { date: true } });
  return row?.date ?? null;
}

/** Totals overall, per profile and per day for an inclusive date range. */
export async function getStats(from: string, to: string): Promise<StatsData> {
  const where = { date: { gte: from, lte: to } };
  const [profiles, byProfile, byDate] = await Promise.all([
    listProfiles(),
    prisma.dailyCount.groupBy({ by: ["profileId"], where, _sum: sumFields }),
    prisma.dailyCount.groupBy({ by: ["date"], where, _sum: sumFields, orderBy: { date: "asc" } }),
  ]);

  const byId = new Map(byProfile.map((row) => [row.profileId, row._sum]));
  const profileStats = profiles.map((p) => ({ ...p, totals: metricsFromSums(byId.get(p.id)) }));

  const totals = emptyMetrics();
  for (const p of profileStats) addMetrics(totals, p.totals);

  return {
    totals,
    profiles: profileStats,
    daily: byDate.map((row) => ({ date: row.date, values: metricsFromSums(row._sum) })),
  };
}
