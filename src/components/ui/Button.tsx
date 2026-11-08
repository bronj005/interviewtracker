import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex select-none items-center justify-center gap-1.5 border-2 border-ink px-3 font-semibold transition " +
  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none " +
  "disabled:pointer-events-none disabled:opacity-40 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-surface shadow-[2px_2px_0_0_var(--ink-muted)] hover:opacity-85",
  secondary: "bg-surface text-ink shadow-[2px_2px_0_0_var(--shadow)] hover:bg-surface-muted",
  danger: "bg-red-600 text-white shadow-[2px_2px_0_0_var(--shadow)] hover:bg-red-700",
  ghost: "border-transparent bg-transparent shadow-none hover:bg-surface-muted",
};

export function buttonClass(variant: Variant = "secondary", className?: string) {
  return cn(base, "h-10 text-sm", variants[variant], className);
}

export function Button({
  variant = "secondary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
