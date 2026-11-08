import type { Metadata } from "next";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { FunnelCard } from "@/components/stats/FunnelCard";
import { ProfileTable } from "@/components/stats/ProfileTable";
import { RangePicker } from "@/components/stats/RangePicker";
import { TrendChart } from "@/components/stats/TrendChart";
import { Box } from "@/components/ui/Box";
import { ButtonLink } from "@/components/ui/Button";
import { formatLongDate, todayISO } from "@/lib/dates";
import { bucketize, parseRangeKey, RANGE_PRESETS, resolveRange } from "@/lib/stats";
import { getFirstRecordedDate, getStats } from "@/server/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Stats · Interview Tracker" };

interface StatsPageProps {
  searchParams: Promise<{ range?: string | string[] }>;
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const { range } = await searchParams;
  const key = parseRangeKey(typeof range === "string" ? range : undefined);
  const firstDate = key === "all" ? await getFirstRecordedDate() : null;
  const { from, to } = resolveRange(key, todayISO(), firstDate);

  const stats = await getStats(from, to);
  const { unit, buckets } = bucketize(stats.daily, from, to);
  const rangeLabel = RANGE_PRESETS.find((p) => p.key === key)?.label ?? "";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-tight sm:text-2xl">Stats</h1>
        <p className="text-sm text-ink-muted">
          {formatLongDate(from)} – {formatLongDate(to)}
        </p>
      </div>
      <RangePicker active={key} />

      {stats.profiles.length === 0 ? (
        <Box className="p-6 text-center">
          <h2 className="text-lg font-black">No profiles yet</h2>
          <p className="mt-1 text-sm text-ink-muted">Add profiles and start counting to see stats here.</p>
          <ButtonLink href="/profiles" variant="primary" className="mt-4">
            + Add profiles
          </ButtonLink>
        </Box>
      ) : (
        <>
          <SummaryBar totals={stats.totals} caption={`Totals for ${rangeLabel}`} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <FunnelCard totals={stats.totals} />
            <TrendChart buckets={buckets} unit={unit} />
          </div>
          <ProfileTable profiles={stats.profiles} />
        </>
      )}
    </div>
  );
}
