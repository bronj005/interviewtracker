import { memo } from "react";
import { cn } from "@/lib/cn";
import { hasAnyMetric, METRICS } from "@/lib/metrics";
import type { MetricValues } from "@/types";

interface DayCellProps {
  date: string;
  totals: MetricValues;
  inMonth: boolean;
  isToday: boolean;
  onSelect: (date: string) => void;
}

export const DayCell = memo(function DayCell({ date, totals, inMonth, isToday, onSelect }: DayCellProps) {
  const day = Number(date.slice(8));
  const active = hasAnyMetric(totals);

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      aria-label={`${date}${active ? `: ${METRICS.map((m) => `${totals[m.key]} ${m.label}`).join(", ")}` : ""}`}
      className={cn(
        "group relative flex min-h-[68px] min-w-0 flex-col border-2 p-1 text-left transition sm:min-h-[118px] sm:p-2",
        "hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_#171717]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
        inMonth ? "border-neutral-900 bg-white" : "border-neutral-300 bg-neutral-100 text-neutral-400",
        isToday && "bg-amber-50 ring-2 ring-amber-400 ring-inset",
      )}
    >
      <span
        className={cn(
          "text-xs font-bold tabular-nums sm:text-sm",
          isToday && "grid size-5 place-items-center bg-neutral-900 text-white sm:size-6",
        )}
      >
        {day}
      </span>

      {active && (
        <span className={cn("mt-auto grid grid-cols-2 gap-0.5 sm:grid-cols-1 sm:gap-1", !inMonth && "opacity-60")}>
          {METRICS.map((m) => (
            <span
              key={m.key}
              className={cn(
                "flex items-center justify-center border px-0.5 text-[10px] font-bold leading-4 tabular-nums sm:justify-between sm:px-1.5 sm:text-xs sm:leading-5",
                m.chip,
                totals[m.key] === 0 && "opacity-35",
              )}
            >
              <span className="hidden sm:inline">{m.short}</span>
              <span>{totals[m.key]}</span>
            </span>
          ))}
        </span>
      )}
    </button>
  );
});
