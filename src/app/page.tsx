import { Dashboard } from "@/components/dashboard/Dashboard";
import { getCalendarDays, monthKey, parseMonthParam } from "@/lib/dates";
import { listCounts } from "@/server/counts";
import { listProfiles } from "@/server/profiles";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ m?: string | string[] }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { m } = await searchParams;
  const ym = parseMonthParam(typeof m === "string" ? m : undefined);
  const days = getCalendarDays(ym);

  const [profiles, counts] = await Promise.all([
    listProfiles(),
    listCounts(days[0], days[days.length - 1]),
  ]);

  // `key` resets client state when switching months.
  return <Dashboard key={monthKey(ym)} ym={ym} profiles={profiles} initialCounts={counts} />;
}
