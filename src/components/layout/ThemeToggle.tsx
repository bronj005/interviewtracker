"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const ORDER: ThemePreference[] = ["system", "light", "dark"];
const META: Record<ThemePreference, { icon: string; label: string }> = {
  system: { icon: "🖥️", label: "System theme" },
  light: { icon: "☀️", label: "Light theme" },
  dark: { icon: "🌙", label: "Dark theme" },
};

/** Cycles System → Light → Dark. "System" follows the device setting live. */
export function ThemeToggle() {
  // null until mounted: the server can't know the stored preference.
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    setPreference(readThemePreference());
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  function cycle() {
    const current = preference ?? "system";
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setPreference(next);
    saveThemePreference(next);
    applyTheme(next);
  }

  const meta = META[preference ?? "system"];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${meta.label} (tap to change)`}
      title={meta.label}
      className="grid size-9 shrink-0 place-items-center border-2 border-ink bg-surface text-base hover:bg-surface-muted"
    >
      <span aria-hidden="true" className={preference ? undefined : "opacity-0"}>
        {meta.icon}
      </span>
    </button>
  );
}
