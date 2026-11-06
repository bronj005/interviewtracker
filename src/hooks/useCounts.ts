"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { emptyMetrics } from "@/lib/metrics";
import type { DailyCount, MetricKey, MetricValues } from "@/types";

type CountMap = Record<string, MetricValues>;

const keyOf = (profileId: string, date: string) => `${profileId}|${date}`;

function toMap(rows: DailyCount[]): CountMap {
  const map: CountMap = {};
  for (const { profileId, date, ...values } of rows) map[keyOf(profileId, date)] = values;
  return map;
}

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Holds counts for a date range with optimistic +/- updates.
 * - Taps update the UI instantly; failed requests are rolled back.
 * - Data refreshes on window focus and every 30s so teammates' changes show up,
 *   but never while local changes are still in flight.
 */
export function useCounts(initial: DailyCount[], from: string, to: string) {
  const [counts, setCounts] = useState<CountMap>(() => toMap(initial));
  const countsRef = useRef(counts);
  const pending = useRef(0);
  const version = useRef(0);
  const [error, setError] = useState<string | null>(null);

  const commit = useCallback((next: CountMap) => {
    countsRef.current = next;
    setCounts(next);
  }, []);

  const applyDelta = useCallback(
    (profileId: string, date: string, metric: MetricKey, delta: number) => {
      const key = keyOf(profileId, date);
      const current = countsRef.current[key] ?? emptyMetrics();
      commit({
        ...countsRef.current,
        [key]: { ...current, [metric]: Math.max(0, current[metric] + delta) },
      });
    },
    [commit],
  );

  const get = useCallback(
    (profileId: string, date: string): MetricValues => counts[keyOf(profileId, date)] ?? emptyMetrics(),
    [counts],
  );

  const adjust = useCallback(
    (profileId: string, date: string, metric: MetricKey, delta: number) => {
      const current = countsRef.current[keyOf(profileId, date)]?.[metric] ?? 0;
      if (current + delta < 0) return;

      version.current++;
      pending.current++;
      applyDelta(profileId, date, metric, delta);

      api
        .adjustCount({ profileId, date, metric, delta })
        .catch((err: Error) => {
          applyDelta(profileId, date, metric, -delta);
          setError(err.message || "Could not save. Please try again.");
        })
        .finally(() => {
          pending.current--;
        });
    },
    [applyDelta],
  );

  const refresh = useCallback(async () => {
    if (pending.current > 0) return;
    const startVersion = version.current;
    try {
      const rows = await api.getCounts(from, to);
      // Skip if the user changed something while we were fetching.
      if (pending.current === 0 && version.current === startVersion) commit(toMap(rows));
    } catch {
      // Background refresh failures are silent; the next one will retry.
    }
  }, [from, to, commit]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(onVisible, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return { get, adjust, error, clearError: () => setError(null) };
}
