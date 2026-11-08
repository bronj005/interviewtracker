import { cn } from "@/lib/cn";
import { METRICS } from "@/lib/metrics";

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink-muted">
      {METRICS.map((m) => (
        <li key={m.key} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("grid size-5 place-items-center border text-[11px]", m.chip)}>
            {m.icon}
          </span>
          {m.label}
        </li>
      ))}
      <li className="text-ink-muted">· Tap a day to update counts</li>
    </ul>
  );
}
