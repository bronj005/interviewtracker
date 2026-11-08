import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { emptyMetrics } from "@/lib/metrics";
import type { AdjustCountInput, SaveNoteInput } from "@/lib/validation";
import type { DailyCount, MetricKey } from "@/types";

const countSelect = {
  profileId: true,
  date: true,
  calls: true,
  round1: true,
  round2: true,
  round3: true,
  note: true,
} as const;

export function listCounts(from: string, to: string): Promise<DailyCount[]> {
  return prisma.dailyCount.findMany({
    where: { date: { gte: from, lte: to } },
    select: countSelect,
    orderBy: { date: "asc" },
  });
}

type PerMetric<T> = Partial<Record<MetricKey, T>>;

/**
 * Atomically changes one counter by `delta`, never letting it go below zero.
 * Uses single-statement increments/decrements, so rapid taps or several
 * teammates updating at once never lose counts.
 */
export async function adjustCount({ profileId, date, metric, delta }: AdjustCountInput): Promise<DailyCount> {
  const where = { profileId_date: { profileId, date } };

  if (delta > 0) {
    const create: PerMetric<number> = { [metric]: delta };
    const update: PerMetric<{ increment: number }> = { [metric]: { increment: delta } };
    try {
      return await prisma.dailyCount.upsert({
        where,
        create: { profileId, date, ...create },
        update,
        select: countSelect,
      });
    } catch (error) {
      // Two first-taps of the day raced on the insert; the row exists now.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return prisma.dailyCount.update({ where, data: update, select: countSelect });
      }
      throw error;
    }
  }

  const amount = -delta;
  const guard: PerMetric<{ gte: number }> = { [metric]: { gte: amount } };
  const decrement: PerMetric<{ decrement: number }> = { [metric]: { decrement: amount } };
  await prisma.dailyCount.updateMany({ where: { profileId, date, ...guard }, data: decrement });

  const row = await prisma.dailyCount.findUnique({ where, select: countSelect });
  return row ?? { profileId, date, ...emptyMetrics(), note: null };
}

/** Sets (or clears, when blank) the note for one profile on one day. */
export async function saveNote({ profileId, date, note }: SaveNoteInput): Promise<DailyCount> {
  const where = { profileId_date: { profileId, date } };
  const value = note.trim() || null;

  if (value === null) {
    // Clearing: never create an empty row just to store "no note".
    await prisma.dailyCount.updateMany({ where: { profileId, date }, data: { note: null } });
    const row = await prisma.dailyCount.findUnique({ where, select: countSelect });
    return row ?? { profileId, date, ...emptyMetrics(), note: null };
  }

  try {
    return await prisma.dailyCount.upsert({
      where,
      create: { profileId, date, note: value },
      update: { note: value },
      select: countSelect,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.dailyCount.update({ where, data: { note: value }, select: countSelect });
    }
    throw error;
  }
}
