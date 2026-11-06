import { cn } from "@/lib/cn";
import { METRICS } from "@/lib/metrics";

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-neutral-600">
      {METRICS.map((m) => (
        <li key={m.key} className="flex items-center gap-1.5">
          <span className={cn("size-3 border", m.chip)} />
          {m.label}
        </li>
      ))}
      <li className="text-neutral-500">· Tap a day to update counts</li>
    </ul>
  );
}
