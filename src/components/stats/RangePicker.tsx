import Link from "next/link";
import { cn } from "@/lib/cn";
import { RANGE_PRESETS, type RangeKey } from "@/lib/stats";

export function RangePicker({ active }: { active: RangeKey }) {
  return (
    <nav
      aria-label="Date range"
      className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {RANGE_PRESETS.map((p) => (
          <Link
            key={p.key}
            href={`/stats?range=${p.key}`}
            aria-current={p.key === active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center whitespace-nowrap border-2 border-ink px-3 text-sm font-semibold",
              p.key === active ? "bg-ink text-surface" : "bg-surface hover:bg-surface-muted",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
