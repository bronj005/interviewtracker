import { ButtonLink } from "@/components/ui/Button";
import { formatMonth, monthKey, shiftMonth, type YearMonth } from "@/lib/dates";

export function MonthNav({ ym }: { ym: YearMonth }) {
  const prev = monthKey(shiftMonth(ym, -1));
  const next = monthKey(shiftMonth(ym, 1));

  return (
    <div className="flex items-center gap-2">
      <ButtonLink href={`/?m=${prev}`} aria-label="Previous month" className="w-10 px-0 text-lg">
        ‹
      </ButtonLink>
      <h1 className="min-w-0 flex-1 text-center text-xl font-black tracking-tight sm:flex-none sm:px-2 sm:text-2xl">
        {formatMonth(ym)}
      </h1>
      <ButtonLink href={`/?m=${next}`} aria-label="Next month" className="w-10 px-0 text-lg">
        ›
      </ButtonLink>
      <ButtonLink href="/" variant="primary" className="ml-1">
        Today
      </ButtonLink>
    </div>
  );
}
