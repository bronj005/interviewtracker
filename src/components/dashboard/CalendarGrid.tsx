import { DayCell } from "@/components/dashboard/DayCell";
import { WEEKDAYS } from "@/lib/dates";
import type { MetricValues } from "@/types";

interface CalendarGridProps {
  days: string[];
  totalsByDate: Record<string, MetricValues>;
  notedDates: Set<string>;
  isInMonth: (date: string) => boolean;
  today: string | null;
  onSelect: (date: string) => void;
}

export function CalendarGrid({ days, totalsByDate, notedDates, isInMonth, today, onSelect }: CalendarGridProps) {
  return (
    <section aria-label="Calendar">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-2 border-ink bg-ink py-1 text-center text-[11px] font-bold uppercase text-surface sm:text-xs"
          >
            <span className="sm:hidden">{d.slice(0, 1)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
        {days.map((date) => (
          <DayCell
            key={date}
            date={date}
            totals={totalsByDate[date]}
            hasNote={notedDates.has(date)}
            inMonth={isInMonth(date)}
            isToday={date === today}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
