import "server-only";
import { nextProfileColor } from "@/lib/colors";
import { prisma } from "@/lib/db";
import { emptyMetrics } from "@/lib/metrics";
import type { CreateProfileInput, UpdateProfileInput } from "@/lib/validation";
import type { Profile, ProfileWithTotals } from "@/types";

const profileSelect = { id: true, name: true, color: true } as const;

export function listProfiles(): Promise<Profile[]> {
  return prisma.profile.findMany({ select: profileSelect, orderBy: { createdAt: "asc" } });
}

export async function listProfilesWithTotals(): Promise<ProfileWithTotals[]> {
  const [profiles, sums] = await Promise.all([
    listProfiles(),
    prisma.dailyCount.groupBy({
      by: ["profileId"],
      _sum: { calls: true, round1: true, round2: true, round3: true },
    }),
  ]);

  const byId = new Map(sums.map((s) => [s.profileId, s._sum]));
  return profiles.map((p) => {
    const sum = byId.get(p.id);
    return {
      ...p,
      totals: sum
        ? {
            calls: sum.calls ?? 0,
            round1: sum.round1 ?? 0,
            round2: sum.round2 ?? 0,
            round3: sum.round3 ?? 0,
          }
        : emptyMetrics(),
    };
  });
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  let color: string | undefined = input.color;
  if (!color) {
    const used = await prisma.profile.findMany({ select: { color: true } });
    color = nextProfileColor(used.map((u) => u.color));
  }
  return prisma.profile.create({ data: { name: input.name, color }, select: profileSelect });
}

export function updateProfile(id: string, input: UpdateProfileInput): Promise<Profile> {
  return prisma.profile.update({ where: { id }, data: input, select: profileSelect });
}

export async function deleteProfile(id: string): Promise<void> {
  // Daily counts are removed by the ON DELETE CASCADE relation.
  await prisma.profile.delete({ where: { id } });
}
