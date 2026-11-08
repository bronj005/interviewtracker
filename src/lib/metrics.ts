import type { MetricKey, MetricValues } from "@/types";

export interface MetricConfig {
  key: MetricKey;
  label: string;
  short: string;
  /** Emoji shown next to the counter everywhere in the UI. */
  icon: string;
  /** Tailwind classes — kept as full literals so Tailwind can detect them. */
  chip: string;
  header: string;
  /** Solid chart fill; dark-mode step validated against the dark surface (dataviz validator). */
  bar: string;
  text: string;
}

/**
 * Single source of truth for the counters shown in the app.
 * Adding a counter = add a column in prisma/schema.prisma + an entry here.
 */
export const METRICS: readonly MetricConfig[] = [
  {
    key: "calls",
    label: "Calls",
    short: "C",
    icon: "📞",
    chip: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
    header: "bg-sky-200 text-sky-950 dark:bg-sky-900 dark:text-sky-100",
    bar: "bg-sky-500 dark:bg-sky-600",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    key: "round1",
    label: "Round 1",
    short: "R1",
    icon: "🥉",
    chip: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    header: "bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100",
    bar: "bg-amber-500 dark:bg-amber-600",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    key: "round2",
    label: "Round 2",
    short: "R2",
    icon: "🥈",
    chip: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-800",
    header: "bg-violet-200 text-violet-950 dark:bg-violet-900 dark:text-violet-100",
    bar: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    key: "round3",
    label: "Round 3",
    short: "R3",
    icon: "🥇",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    header: "bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100",
    bar: "bg-emerald-500 dark:bg-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
  },
] as const;

export const METRIC_KEYS = METRICS.map((m) => m.key) as [MetricKey, ...MetricKey[]];

export function emptyMetrics(): MetricValues {
  return { calls: 0, round1: 0, round2: 0, round3: 0 };
}

/** Converts a Prisma `_sum` result (nullable fields) into plain counter values. */
export function metricsFromSums(sum: Partial<Record<MetricKey, number | null>> | null | undefined): MetricValues {
  const values = emptyMetrics();
  if (sum) for (const key of METRIC_KEYS) values[key] = sum[key] ?? 0;
  return values;
}

export function addMetrics(target: MetricValues, source: MetricValues): MetricValues {
  for (const key of METRIC_KEYS) target[key] += source[key];
  return target;
}

/** Percentage of `part` over `whole`, or null when `whole` is 0. */
export function rate(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

export function hasAnyMetric(values: MetricValues): boolean {
  return METRIC_KEYS.some((key) => values[key] > 0);
}
