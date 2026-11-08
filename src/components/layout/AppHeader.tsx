"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Calendar" },
  { href: "/stats", label: "Stats" },
  { href: "/profiles", label: "Profiles" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-8 place-items-center border-2 border-ink bg-amber-300 text-sm text-neutral-900">
            IT
          </span>
          <span className="hidden sm:inline">Interview Tracker</span>
        </Link>
        <nav className="ml-auto flex">
          {NAV.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "-ml-[2px] border-2 border-ink px-2.5 py-1.5 text-sm font-semibold sm:px-3",
                  active ? "bg-ink text-surface" : "bg-surface hover:bg-surface-muted",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
