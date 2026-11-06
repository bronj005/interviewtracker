/**
 * Date helpers. Days are represented as "YYYY-MM-DD" strings and months as
 * "YYYY-MM" so nothing depends on server/client timezones.
 * All Date objects here are local-time midnight values.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isValidISODate(value: string): boolean {
  const m = ISO_DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(value: string, days: number): string {
  const d = parseISODate(value);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export interface YearMonth {
  year: number;
  /** 0-based month (0 = January) */
  month: number;
}

/** Parses "YYYY-MM"; falls back to the current month for missing/invalid input. */
export function parseMonthParam(value: string | undefined, now = new Date()): YearMonth {
  const m = value ? MONTH_RE.exec(value) : null;
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    if (year >= 2000 && year <= 2100 && month >= 0 && month <= 11) return { year, month };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function monthKey({ year, month }: YearMonth): string {
  return `${year}-${pad(month + 1)}`;
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function formatMonth({ year, month }: YearMonth): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatLongDate(value: string): string {
  // e.g. "Thu, 5 Nov 2026" — short enough for phone headers.
  return parseISODate(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * All days shown in a Monday-first month grid, including leading/trailing
 * days of adjacent months so every week row is complete.
 */
export function getCalendarDays({ year, month }: YearMonth): string[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  const days: string[] = [];
  for (let i = 0; i < total; i++) {
    days.push(toISODate(new Date(year, month, 1 - lead + i)));
  }
  return days;
}

export function isInMonth(value: string, ym: YearMonth): boolean {
  return value.startsWith(`${monthKey(ym)}-`);
}
