import { Box } from "@/components/ui/Box";
import { METRICS, rate } from "@/lib/metrics";
import type { ProfileWithTotals } from "@/types";

/** Conversion is only meaningful with enough calls (1 call → 1 round ≠ "100%"). */
const MIN_CALLS_FOR_RATE = 5;

const badge = "whitespace-nowrap border border-ink px-1.5 text-[10px] font-bold uppercase";

export function ProfileTable({ profiles }: { profiles: ProfileWithTotals[] }) {
  const rows = [...profiles].sort((a, b) => b.totals.calls - a.totals.calls);
  const conversion = (p: ProfileWithTotals) =>
    p.totals.calls >= MIN_CALLS_FOR_RATE ? rate(p.totals.round1, p.totals.calls) : null;

  const mostCallsId = rows[0] && rows[0].totals.calls > 0 ? rows[0].id : null;
  let bestId: string | null = null;
  let bestRate = 0;
  for (const p of rows) {
    const r = conversion(p);
    if (r !== null && r > bestRate) [bestId, bestRate] = [p.id, r];
  }

  return (
    <Box className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-b-2 border-ink p-3">
        <h2 className="font-black">By profile</h2>
        <span className="text-xs text-ink-muted">
          📞→🥉 = Round 1 per call (shown from {MIN_CALLS_FOR_RATE}+ calls)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-surface-muted text-xs">
            <tr>
              <th className="p-2 text-left font-bold uppercase">Profile</th>
              {METRICS.map((m) => (
                <th key={m.key} className="p-2 text-right" title={m.label}>
                  <span aria-hidden="true">{m.icon}</span>
                  <span className="sr-only">{m.label}</span>
                </th>
              ))}
              <th className="p-2 text-right" title="Round 1 per call">
                <span aria-hidden="true">📞→🥉</span>
                <span className="sr-only">Round 1 per call</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const r = conversion(p);
              return (
                <tr key={p.id} className="border-t border-ink-soft">
                  <td className="p-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="size-3 shrink-0 border-2 border-ink" style={{ backgroundColor: p.color }} />
                      <span className="font-semibold">{p.name}</span>
                      {p.id === mostCallsId && <span className={badge}>🔥 Most calls</span>}
                      {p.id === bestId && <span className={badge}>⭐ Best conversion</span>}
                    </div>
                  </td>
                  {METRICS.map((m) => (
                    <td key={m.key} className="p-2 text-right tabular-nums">
                      {p.totals[m.key]}
                    </td>
                  ))}
                  <td className="p-2 text-right font-bold tabular-nums">{r === null ? "—" : `${r}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Box>
  );
}
