import { memo } from "react";
import { cn } from "@/lib/cn";
import { hasAnyMetric, METRICS } from "@/lib/metrics";
import type { MetricValues } from "@/types";

interface DayCellProps {
  date: string;
  totals: MetricValues;
  hasNote: boolean;
  inMonth: boolean;
  isToday: boolean;
  onSelect: (date: string) => void;
}

export const DayCell = memo(function DayCell({
  date,
  totals,
  hasNote,
  inMonth,
  isToday,
  onSelect,
}: DayCellProps) {
  const day = Number(date.slice(8));
  const active = hasAnyMetric(totals);

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      aria-label={`${date}${active ? `: ${METRICS.map((m) => `${totals[m.key]} ${m.label}`).join(", ")}` : ""}${hasNote ? ", has notes" : ""}`}
      className={cn(
        "group relative flex min-h-[68px] min-w-0 flex-col border-2 p-1 text-left transition sm:min-h-[118px] sm:p-2",
        "hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--shadow)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        inMonth ? "border-ink bg-surface" : "border-ink-soft bg-surface-muted text-ink-muted/60",
        isToday && "bg-amber-50 ring-2 ring-amber-400 ring-inset dark:bg-amber-950/40",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold tabular-nums sm:text-sm",
          isToday && "grid size-5 place-items-center bg-ink text-surface sm:size-6",
        )}
      >
        {day}
      </span>

      {hasNote && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 text-[10px] leading-none sm:right-1.5 sm:top-1.5 sm:text-xs"
        >
          📝
        </span>
      )}

      {active && (
        <span className={cn("mt-auto grid grid-cols-1 gap-0.5 sm:gap-1", !inMonth && "opacity-60")}>
          {METRICS.map((m) => (
            <span
              key={m.key}
              className={cn(
                "flex items-center justify-between gap-0.5 border px-0.5 text-[10px] font-bold leading-4 tabular-nums sm:px-1.5 sm:text-xs sm:leading-5",
                m.chip,
                // Zero counters: hidden on phones to save space, faded on larger screens.
                totals[m.key] === 0 && "hidden opacity-35 sm:flex",
              )}
            >
              <span aria-hidden="true" className="leading-none">
                {m.icon}
              </span>
              <span>{totals[m.key]}</span>
            </span>
          ))}
        </span>
      )}
    </button>
  );
});
