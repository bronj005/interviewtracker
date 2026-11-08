import { addDays, daysBetween, formatShortDate, parseISODate, startOfWeek } from "@/lib/dates";
import { addMetrics, emptyMetrics } from "@/lib/metrics";
import type { MetricValues } from "@/types";

export const RANGE_PRESETS = [
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
] as const;

export type RangeKey = (typeof RANGE_PRESETS)[number]["key"];

export function parseRangeKey(value: string | undefined): RangeKey {
  return RANGE_PRESETS.find((p) => p.key === value)?.key ?? "this-month";
}

/** Concrete dates for a preset. `firstDate` is the earliest recorded day (used by "all"). */
export function resolveRange(key: RangeKey, today: string, firstDate: string | null) {
  const monthStart = `${today.slice(0, 8)}01`;
  switch (key) {
    case "this-month":
      return { from: monthStart, to: today };
    case "last-month": {
      const lastOfPrev = addDays(monthStart, -1);
      return { from: `${lastOfPrev.slice(0, 8)}01`, to: lastOfPrev };
    }
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "90d":
      return { from: addDays(today, -89), to: today };
    case "all":
      return { from: firstDate && firstDate < today ? firstDate : today, to: today };
  }
}

export type BucketUnit = "day" | "week" | "month";

export interface Bucket {
  key: string;
  label: string;
  from: string;
  to: string;
  values: MetricValues;
}

/** Day bars up to a month, week bars up to ~6 months, month bars beyond. */
export function bucketUnitFor(from: string, to: string): BucketUnit {
  const span = daysBetween(from, to) + 1;
  if (span <= 31) return "day";
  if (span <= 182) return "week";
  return "month";
}

const bucketKey = (date: string, unit: BucketUnit) =>
  unit === "day" ? date : unit === "week" ? startOfWeek(date) : date.slice(0, 7);

function bucketLabel(key: string, unit: BucketUnit) {
  if (unit === "month") {
    return parseISODate(`${key}-01`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  }
  return formatShortDate(key);
}

/** Groups daily totals into continuous buckets covering [from, to] (empty buckets included). */
export function bucketize(
  daily: { date: string; values: MetricValues }[],
  from: string,
  to: string,
): { unit: BucketUnit; buckets: Bucket[] } {
  const unit = bucketUnitFor(from, to);
  const buckets: Bucket[] = [];
  const byKey = new Map<string, Bucket>();

  for (let date = from; date <= to; date = addDays(date, 1)) {
    const key = bucketKey(date, unit);
    let bucket = byKey.get(key);
    if (!bucket) {
      bucket = { key, label: bucketLabel(key, unit), from: date, to: date, values: emptyMetrics() };
      byKey.set(key, bucket);
      buckets.push(bucket);
    }
    bucket.to = date;
  }

  for (const { date, values } of daily) {
    const bucket = byKey.get(bucketKey(date, unit));
    if (bucket) addMetrics(bucket.values, values);
  }
  return { unit, buckets };
}
