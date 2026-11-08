import { cn } from "@/lib/cn";
import type { Profile } from "@/types";

export const ALL_PROFILES = "all";

interface ProfileFilterProps {
  profiles: Profile[];
  value: string;
  onChange: (value: string) => void;
}

/** Horizontally scrollable chips: "All" + one per profile. */
export function ProfileFilter({ profiles, value, onChange }: ProfileFilterProps) {
  const options: Array<{ id: string; name: string; color?: string }> = [
    { id: ALL_PROFILES, name: "All profiles" },
    ...profiles,
  ];

  return (
    <div
      className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      role="radiogroup"
      aria-label="Filter by profile"
    >
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {options.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p.id)}
              className={cn(
                "flex h-9 items-center gap-2 whitespace-nowrap border-2 border-ink px-3 text-sm font-semibold",
                active ? "bg-ink text-surface" : "bg-surface hover:bg-surface-muted",
              )}
            >
              {p.color && (
                <span className="size-2.5 border border-ink" style={{ backgroundColor: p.color }} />
              )}
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
