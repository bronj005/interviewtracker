import type { Metadata } from "next";
import { ProfileManager } from "@/components/profiles/ProfileManager";
import { listProfilesWithTotals } from "@/server/profiles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profiles · Interview Tracker" };

export default async function ProfilesPage() {
  const profiles = await listProfilesWithTotals();
  return <ProfileManager initialProfiles={profiles} />;
}
