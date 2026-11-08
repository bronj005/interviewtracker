"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { emptyMetrics, METRIC_KEYS } from "@/lib/metrics";
import type { DailyCount, MetricKey, MetricValues } from "@/types";

type CountMap = Record<string, MetricValues>;
type NoteMap = Record<string, string>;

const keyOf = (profileId: string, date: string) => `${profileId}|${date}`;

function toMaps(rows: DailyCount[]): { counts: CountMap; notes: NoteMap } {
  const counts: CountMap = {};
  const notes: NoteMap = {};
  for (const row of rows) {
    const key = keyOf(row.profileId, row.date);
    const values = emptyMetrics();
    for (const metric of METRIC_KEYS) values[metric] = row[metric];
    counts[key] = values;
    if (row.note) notes[key] = row.note;
  }
  return { counts, notes };
}

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Holds counts + notes for a date range with optimistic updates.
 * - Taps/saves update the UI instantly; failed requests are rolled back.
 * - Data refreshes on window focus and every 30s so teammates' changes show up,
 *   but never while local changes are still in flight.
 */
export function useCounts(initial: DailyCount[], from: string, to: string) {
  const [state, setState] = useState(() => toMaps(initial));
  const stateRef = useRef(state);
  const pending = useRef(0);
  const version = useRef(0);
  const [error, setError] = useState<string | null>(null);

  const commit = useCallback((next: { counts: CountMap; notes: NoteMap }) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const applyDelta = useCallback(
    (profileId: string, date: string, metric: MetricKey, delta: number) => {
      const key = keyOf(profileId, date);
      const { counts, notes } = stateRef.current;
      const current = counts[key] ?? emptyMetrics();
      commit({
        notes,
        counts: { ...counts, [key]: { ...current, [metric]: Math.max(0, current[metric] + delta) } },
      });
    },
    [commit],
  );

  const applyNote = useCallback(
    (profileId: string, date: string, note: string) => {
      const key = keyOf(profileId, date);
      const notes = { ...stateRef.current.notes };
      if (note) notes[key] = note;
      else delete notes[key];
      commit({ counts: stateRef.current.counts, notes });
    },
    [commit],
  );

  const get = useCallback(
    (profileId: string, date: string): MetricValues => state.counts[keyOf(profileId, date)] ?? emptyMetrics(),
    [state.counts],
  );

  const getNote = useCallback(
    (profileId: string, date: string): string => state.notes[keyOf(profileId, date)] ?? "",
    [state.notes],
  );

  /** Tracks an in-flight request so background refreshes don't overwrite it. */
  const track = useCallback(<T,>(promise: Promise<T>) => {
    version.current++;
    pending.current++;
    return promise.finally(() => {
      pending.current--;
    });
  }, []);

  const adjust = useCallback(
    (profileId: string, date: string, metric: MetricKey, delta: number) => {
      const current = stateRef.current.counts[keyOf(profileId, date)]?.[metric] ?? 0;
      if (current + delta < 0) return;

      applyDelta(profileId, date, metric, delta);
      track(api.adjustCount({ profileId, date, metric, delta })).catch((err: Error) => {
        applyDelta(profileId, date, metric, -delta);
        setError(err.message || "Could not save. Please try again.");
      });
    },
    [applyDelta, track],
  );

  /** Saves a note (blank clears it). Resolves to true on success. */
  const saveNote = useCallback(
    async (profileId: string, date: string, note: string): Promise<boolean> => {
      const previous = stateRef.current.notes[keyOf(profileId, date)] ?? "";
      const next = note.trim();
      applyNote(profileId, date, next);
      try {
        await track(api.saveNote({ profileId, date, note: next }));
        return true;
      } catch (err) {
        applyNote(profileId, date, previous);
        setError((err as Error).message || "Could not save the note. Please try again.");
        return false;
      }
    },
    [applyNote, track],
  );

  const refresh = useCallback(async () => {
    if (pending.current > 0) return;
    const startVersion = version.current;
    try {
      const rows = await api.getCounts(from, to);
      // Skip if the user changed something while we were fetching.
      if (pending.current === 0 && version.current === startVersion) commit(toMaps(rows));
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

  return { get, getNote, adjust, saveNote, error, clearError: () => setError(null) };
}
