import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex select-none items-center justify-center gap-1.5 border-2 border-neutral-900 px-3 font-semibold transition " +
  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none " +
  "disabled:pointer-events-none disabled:opacity-40 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white shadow-[2px_2px_0_0_#737373] hover:bg-neutral-700",
  secondary: "bg-white text-neutral-900 shadow-[2px_2px_0_0_#171717] hover:bg-neutral-100",
  danger: "bg-red-600 text-white shadow-[2px_2px_0_0_#171717] hover:bg-red-700",
  ghost: "border-transparent bg-transparent shadow-none hover:bg-neutral-200",
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
