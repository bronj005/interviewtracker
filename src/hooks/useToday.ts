"use client";

import { useEffect, useState } from "react";
import { toISODate } from "@/lib/dates";

/**
 * Today's date ("YYYY-MM-DD") in the viewer's local timezone.
 * Null during server render to avoid hydration mismatches; updates at midnight.
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setToday(toISODate(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return today;
}
