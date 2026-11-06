"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarGrid } from "@/components/dashboard/CalendarGrid";
import { DayPanel } from "@/components/dashboard/DayPanel";
import { Legend } from "@/components/dashboard/Legend";
import { MonthNav } from "@/components/dashboard/MonthNav";
import { ALL_PROFILES, ProfileFilter } from "@/components/dashboard/ProfileFilter";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { Box } from "@/components/ui/Box";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { useCounts } from "@/hooks/useCounts";
import { useToday } from "@/hooks/useToday";
import { getCalendarDays, isInMonth, type YearMonth } from "@/lib/dates";
import { addMetrics, emptyMetrics } from "@/lib/metrics";
import type { DailyCount, MetricValues, Profile } from "@/types";

const FILTER_STORAGE_KEY = "interview-tracker:profile-filter";

interface DashboardProps {
  ym: YearMonth;
  profiles: Profile[];
  initialCounts: DailyCount[];
}

export function Dashboard({ ym, profiles, initialCounts }: DashboardProps) {
  const days = useMemo(() => getCalendarDays(ym), [ym]);
  const from = days[0];
  const to = days[days.length - 1];

  const { get, adjust, error, clearError } = useCounts(initialCounts, from, to);
  const today = useToday();
  const [filter, setFilter] = useState<string>(ALL_PROFILES);
  const [selected, setSelected] = useState<string | null>(null);

  // Restore the last-used filter (per browser), ignoring deleted profiles.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved && profiles.some((p) => p.id === saved)) setFilter(saved);
    } catch {
      /* storage unavailable — keep default */
    }
  }, [profiles]);

  const changeFilter = useCallback((value: string) => {
    setFilter(value);
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const visibleProfiles = useMemo(
    () => (filter === ALL_PROFILES ? profiles : profiles.filter((p) => p.id === filter)),
    [filter, profiles],
  );

  const totalsByDate = useMemo(() => {
    const map: Record<string, MetricValues> = {};
    for (const date of days) {
      const sum = emptyMetrics();
      for (const p of visibleProfiles) addMetrics(sum, get(p.id, date));
      map[date] = sum;
    }
    return map;
  }, [days, visibleProfiles, get]);

  const monthTotals = useMemo(() => {
    const sum = emptyMetrics();
    for (const date of days) if (isInMonth(date, ym)) addMetrics(sum, totalsByDate[date]);
    return sum;
  }, [days, ym, totalsByDate]);

  const inMonth = useCallback((date: string) => isInMonth(date, ym), [ym]);
  const closePanel = useCallback(() => setSelected(null), []);

  if (profiles.length === 0) {
    return (
      <div className="space-y-4">
        <MonthNav ym={ym} />
        <Box className="p-6 text-center">
          <h2 className="text-lg font-black">No profiles yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-600">
            Add the job-portal profiles you apply with (e.g. &ldquo;Naukri – React Dev&rdquo;), then start
            counting calls and rounds.
          </p>
          <ButtonLink href="/profiles" variant="primary" className="mt-4">
            + Add profiles
          </ButtonLink>
        </Box>
      </div>
    );
  }

  const selectedIndex = selected ? days.indexOf(selected) : -1;
  const selectedFilterName =
    filter === ALL_PROFILES ? "all profiles" : (visibleProfiles[0]?.name ?? "selected profile");

  return (
    <div className="space-y-4">
      <MonthNav ym={ym} />
      <ProfileFilter profiles={profiles} value={filter} onChange={changeFilter} />
      <SummaryBar totals={monthTotals} caption={`Month totals for ${selectedFilterName}`} />
      <CalendarGrid
        days={days}
        totalsByDate={totalsByDate}
        isInMonth={inMonth}
        today={today}
        onSelect={setSelected}
      />
      <Legend />

      {selected && selectedIndex >= 0 && (
        <DayPanel
          date={selected}
          isToday={selected === today}
          profiles={visibleProfiles}
          totals={totalsByDate[selected]}
          getCounts={get}
          onAdjust={adjust}
          onPrev={selectedIndex > 0 ? () => setSelected(days[selectedIndex - 1]) : undefined}
          onNext={selectedIndex < days.length - 1 ? () => setSelected(days[selectedIndex + 1]) : undefined}
          onClose={closePanel}
        />
      )}

      <ErrorToast message={error} onDismiss={clearError} />
    </div>
  );
}
