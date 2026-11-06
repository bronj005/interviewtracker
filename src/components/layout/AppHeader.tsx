"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Calendar" },
  { href: "/profiles", label: "Profiles" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-neutral-900 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-8 place-items-center border-2 border-neutral-900 bg-amber-300 text-sm">
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
                  "-ml-[2px] border-2 border-neutral-900 px-3 py-1.5 text-sm font-semibold",
                  active ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-100",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
