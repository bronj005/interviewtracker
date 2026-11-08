import { Box } from "@/components/ui/Box";
import { cn } from "@/lib/cn";
import { METRICS, rate } from "@/lib/metrics";
import type { MetricValues } from "@/types";

/** Calls → Round 1 → Round 2 → Round 3, with step-by-step conversion. */
export function FunnelCard({ totals }: { totals: MetricValues }) {
  const max = Math.max(1, ...METRICS.map((m) => totals[m.key]));
  const first = METRICS[0];
  const last = METRICS[METRICS.length - 1];
  const overall = rate(totals[last.key], totals[first.key]);

  return (
    <Box className="p-3 sm:p-4">
      <h2 className="font-black">Conversion funnel</h2>
      <p className="text-xs text-ink-muted">How calls turn into interview rounds</p>

      <ol className="mt-4 space-y-3">
        {METRICS.map((m, i) => {
          const value = totals[m.key];
          const prev = i > 0 ? METRICS[i - 1] : null;
          const pct = prev ? rate(value, totals[prev.key]) : null;
          const width = value > 0 ? Math.max((value / max) * 100, 1.5) : 0;
          return (
            <li key={m.key}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">
                  <span aria-hidden="true">{m.icon}</span> {m.label}
                </span>
                <span className="font-black tabular-nums">{value}</span>
              </div>
              <div className="mt-1 h-3 bg-surface-muted">
                <div className={cn("h-full rounded-r-[4px]", m.bar)} style={{ width: `${width}%` }} />
              </div>
              {prev && (
                <div className="mt-0.5 text-xs text-ink-muted">
                  {pct === null ? "—" : `${pct}%`} of {prev.label}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-baseline justify-between border-t-2 border-ink pt-2 text-sm">
        <span>
          {first.label} → {last.label}
        </span>
        <span className="font-black tabular-nums">{overall === null ? "—" : `${overall}%`}</span>
      </div>
    </Box>
  );
}
