import { Box } from "@/components/ui/Box";
import { cn } from "@/lib/cn";
import { formatLongDate, formatShortDate } from "@/lib/dates";
import { METRICS } from "@/lib/metrics";
import type { Bucket, BucketUnit } from "@/lib/stats";

const UNIT_LABEL: Record<BucketUnit, string> = { day: "day", week: "week", month: "month" };

function periodLabel(bucket: Bucket, unit: BucketUnit) {
  if (unit === "day") return formatLongDate(bucket.from);
  if (unit === "week") return `${formatShortDate(bucket.from)} – ${formatShortDate(bucket.to)}`;
  return bucket.label;
}

/**
 * Calls over time as a single-series bar chart (CSS only, no chart library).
 * Hover / tap a bar for all four counters; peak and latest bars are labeled.
 */
export function TrendChart({ buckets, unit }: { buckets: Bucket[]; unit: BucketUnit }) {
  const calls = buckets.map((b) => b.values.calls);
  const max = Math.max(1, ...calls);
  const peakIndex = calls.indexOf(Math.max(...calls));
  const lastIndex = buckets.length - 1;
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 7));

  return (
    <Box className="min-w-0 p-3 sm:p-4">
      <h2 className="font-black">
        <span aria-hidden="true">📞</span> Calls per {UNIT_LABEL[unit]}
      </h2>
      <p className="text-xs text-ink-muted">Tap or hover a bar for rounds</p>

      <div className="relative mt-8 h-44 sm:h-56">
        {/* Recessive grid: top (max) and middle guides + solid baseline. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-dashed border-ink-soft" />
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-ink-soft" />
        <span aria-hidden="true" className="absolute -top-4 left-0 text-[10px] tabular-nums text-ink-muted">
          {max}
        </span>

        <div className="absolute inset-0 flex items-end gap-[2px] border-b-2 border-ink">
          {buckets.map((b, i) => {
            const value = b.values.calls;
            const height = (value / max) * 100;
            const showLabel = value > 0 && (i === peakIndex || i === lastIndex);
            const alignRight = i > buckets.length / 2;
            return (
              <button
                key={b.key}
                type="button"
                aria-label={`${periodLabel(b, unit)}: ${METRICS.map((m) => `${b.values[m.key]} ${m.label}`).join(", ")}`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                <span
                  className={cn(
                    "w-full max-w-10 rounded-t-[4px] bg-sky-500 transition-opacity group-hover:opacity-80 group-focus:opacity-80 dark:bg-sky-600",
                  )}
                  style={{ height: `${height}%` }}
                />
                {showLabel && (
                  <span
                    aria-hidden="true"
                    className="absolute text-[10px] font-bold tabular-nums text-ink"
                    style={{ bottom: `calc(${height}% + 2px)` }}
                  >
                    {value}
                  </span>
                )}
                <span
                  role="tooltip"
                  className={cn(
                    "pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max min-w-32 border-2 border-ink bg-surface p-2 text-left text-xs shadow-[2px_2px_0_0_var(--shadow)] group-hover:block group-focus:block",
                    alignRight ? "right-0" : "left-0",
                  )}
                >
                  <span className="mb-1 block font-bold">{periodLabel(b, unit)}</span>
                  {METRICS.map((m) => (
                    <span key={m.key} className="flex justify-between gap-3">
                      <span>
                        <span aria-hidden="true">{m.icon}</span> {m.label}
                      </span>
                      <span className="font-bold tabular-nums">{b.values[m.key]}</span>
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-hidden="true" className="mt-1 flex gap-[2px]">
        {buckets.map((b, i) => (
          <span key={b.key} className="min-w-0 flex-1 whitespace-nowrap text-center text-[10px] text-ink-muted">
            {i % labelEvery === 0 ? b.label : ""}
          </span>
        ))}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-ink-muted">Show as table</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="p-1 text-left">Period</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="p-1 text-right">
                    {m.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.key} className="border-t border-ink-soft">
                  <td className="p-1">{periodLabel(b, unit)}</td>
                  {METRICS.map((m) => (
                    <td key={m.key} className="p-1 text-right tabular-nums">
                      {b.values[m.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Box>
  );
}
