import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** The app's basic "boxy" surface: hard border + offset shadow. */
export function Box({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-2 border-ink bg-surface shadow-[3px_3px_0_0_var(--shadow)]", className)}
      {...props}
    />
  );
}
