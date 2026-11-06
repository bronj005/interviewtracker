import { cn } from "@/lib/cn";

interface StepperProps {
  label: string;
  value: number;
  onChange: (delta: number) => void;
  className?: string;
  headerClassName?: string;
}

/** A − value + counter with large touch targets. */
export function Stepper({ label, value, onChange, className, headerClassName }: StepperProps) {
  return (
    <div className={cn("border-2 border-neutral-900", className)}>
      <div
        className={cn(
          "border-b-2 border-neutral-900 px-2 py-0.5 text-center text-xs font-bold uppercase tracking-wide",
          headerClassName,
        )}
      >
        {label}
      </div>
      <div className="flex items-stretch bg-white">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
          className="grid h-11 w-11 shrink-0 place-items-center border-r-2 border-neutral-900 text-xl font-bold hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-30"
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
          className="grid h-11 w-11 shrink-0 place-items-center border-l-2 border-neutral-900 bg-neutral-900 text-xl font-bold text-white hover:bg-neutral-700 active:bg-neutral-600"
        >
          +
        </button>
      </div>
    </div>
  );
}
