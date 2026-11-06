/** Palette offered for profile colors. */
export const PROFILE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#0d9488",
  "#65a30d",
  "#475569",
] as const;

/** Picks the first palette color not yet used, cycling when all are taken. */
export function nextProfileColor(used: readonly string[]): string {
  const free = PROFILE_COLORS.find((c) => !used.includes(c));
  return free ?? PROFILE_COLORS[used.length % PROFILE_COLORS.length];
}
