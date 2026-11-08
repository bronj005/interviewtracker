export type MetricKey = "calls" | "round1" | "round2" | "round3";

export type MetricValues = Record<MetricKey, number>;

export interface Profile {
  id: string;
  name: string;
  color: string;
}

export interface ProfileWithTotals extends Profile {
  totals: MetricValues;
}

export interface DailyCount extends MetricValues {
  profileId: string;
  /** "YYYY-MM-DD" */
  date: string;
  note: string | null;
}
