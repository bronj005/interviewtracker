import type { MetricKey, MetricValues } from "@/types";

export interface MetricConfig {
  key: MetricKey;
  label: string;
  short: string;
  /** Tailwind classes — kept as full literals so Tailwind can detect them. */
  chip: string;
  header: string;
  dot: string;
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
    chip: "bg-sky-100 text-sky-900 border-sky-300",
    header: "bg-sky-200 text-sky-950",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  {
    key: "round1",
    label: "Round 1",
    short: "R1",
    chip: "bg-amber-100 text-amber-900 border-amber-300",
    header: "bg-amber-200 text-amber-950",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  {
    key: "round2",
    label: "Round 2",
    short: "R2",
    chip: "bg-violet-100 text-violet-900 border-violet-300",
    header: "bg-violet-200 text-violet-950",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  {
    key: "round3",
    label: "Round 3",
    short: "R3",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-300",
    header: "bg-emerald-200 text-emerald-950",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
] as const;

export const METRIC_KEYS = METRICS.map((m) => m.key) as [MetricKey, ...MetricKey[]];

export function emptyMetrics(): MetricValues {
  return { calls: 0, round1: 0, round2: 0, round3: 0 };
}

export function addMetrics(target: MetricValues, source: MetricValues): MetricValues {
  for (const key of METRIC_KEYS) target[key] += source[key];
  return target;
}

export function hasAnyMetric(values: MetricValues): boolean {
  return METRIC_KEYS.some((key) => values[key] > 0);
}
