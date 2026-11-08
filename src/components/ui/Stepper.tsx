import { cn } from "@/lib/cn";

interface StepperProps {
  label: string;
  icon?: string;
  value: number;
  onChange: (delta: number) => void;
  className?: string;
  headerClassName?: string;
}

/** A − value + counter with large touch targets. */
export function Stepper({ label, icon, value, onChange, className, headerClassName }: StepperProps) {
  return (
    <div className={cn("border-2 border-ink", className)}>
      <div
        className={cn(
          "border-b-2 border-ink px-2 py-0.5 text-center text-xs font-bold uppercase tracking-wide",
          headerClassName,
        )}
      >
        {icon && (
          <span aria-hidden="true" className="mr-1">
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="flex items-stretch bg-surface">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
          className="grid h-11 w-11 shrink-0 place-items-center border-r-2 border-ink text-xl font-bold hover:bg-surface-muted active:bg-surface-muted disabled:opacity-30"
        >
          −
        </button>
        <output
          aria-live="polite"
          className="grid min-w-0 flex-1 place-items-center text-lg font-bold tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(1)}
          aria-label={`Increase ${label}`}
          className="grid h-11 w-11 shrink-0 place-items-center border-l-2 border-ink bg-ink text-xl font-bold text-surface hover:opacity-85 active:opacity-75"
        >
          +
        </button>
      </div>
    </div>
  );
}
