import { Box } from "@/components/ui/Box";
import { cn } from "@/lib/cn";
import { METRICS } from "@/lib/metrics";
import type { MetricValues } from "@/types";

export function SummaryBar({ totals, caption }: { totals: MetricValues; caption: string }) {
  return (
    <section aria-label={caption} className="grid grid-cols-4 gap-2 sm:gap-3">
      {METRICS.map((m) => (
        <Box key={m.key} className="min-w-0 p-2 sm:p-3">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-2.5 shrink-0 border border-neutral-900", m.dot)} />
            <span className="truncate text-[11px] font-bold uppercase tracking-wide text-neutral-600 sm:text-xs">
              <span className="sm:hidden">{m.short}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </span>
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums sm:text-3xl">{totals[m.key]}</div>
        </Box>
      ))}
    </section>
  );
}
