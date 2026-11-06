"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { PROFILE_COLORS } from "@/lib/colors";
import { emptyMetrics, METRICS } from "@/lib/metrics";
import type { ProfileWithTotals } from "@/types";

const inputClass =
  "h-10 w-full min-w-0 border-2 border-neutral-900 bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1";

export function ProfileManager({ initialProfiles }: { initialProfiles: ProfileWithTotals[] }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const profile = await api.createProfile({ name });
      setProfiles((prev) => [...prev, { ...profile, totals: emptyMetrics() }]);
      setNewName("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(id: string, input: { name?: string; color?: string }) {
    try {
      const updated = await api.updateProfile(id, input);
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      router.refresh();
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }

  async function handleDelete(profile: ProfileWithTotals) {
    const ok = window.confirm(
      `Delete "${profile.name}"?\n\nAll of its daily counts will be permanently removed.`,
    );
    if (!ok) return;
    try {
      await api.deleteProfile(profile.id);
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-tight sm:text-2xl">Profiles</h1>
        <p className="text-sm text-neutral-600">The job-portal profiles you apply with every day.</p>
      </div>

      <Box className="p-3">
        <form onSubmit={handleAdd} className="flex gap-2">
          <label htmlFor="new-profile" className="sr-only">
            Profile name
          </label>
          <input
            id="new-profile"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Naukri – React Developer"
            className={inputClass}
          />
          <Button type="submit" variant="primary" disabled={!newName.trim() || busy} className="shrink-0">
            {busy ? "Adding…" : "+ Add"}
          </Button>
        </form>
      </Box>

      {profiles.length === 0 ? (
        <p className="border-2 border-dashed border-neutral-400 p-6 text-center text-sm text-neutral-500">
          No profiles yet. Add your first one above.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {profiles.map((p) => (
            <ProfileRow key={p.id} profile={p} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      <ErrorToast message={error} onDismiss={() => setError(null)} />
    </div>
  );
}

interface ProfileRowProps {
  profile: ProfileWithTotals;
  onUpdate: (id: string, input: { name?: string; color?: string }) => Promise<boolean>;
  onDelete: (profile: ProfileWithTotals) => void;
}

function ProfileRow({ profile, onUpdate, onDelete }: ProfileRowProps) {
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === profile.name) {
      setName(profile.name);
      return;
    }
    setSaving(true);
    const ok = await onUpdate(profile.id, { name: trimmed });
    if (!ok) setName(profile.name);
    setSaving(false);
  }

  return (
    <li>
      <Box className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span
            className="size-5 shrink-0 border-2 border-neutral-900"
            style={{ backgroundColor: profile.color }}
          />
          <input
            aria-label="Profile name"
            value={name}
            maxLength={40}
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setName(profile.name);
                e.currentTarget.blur();
              }
            }}
            className={cn(inputClass, "font-bold")}
          />
          <Button variant="danger" onClick={() => onDelete(profile)} className="shrink-0">
            Delete
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Profile color">
          {PROFILE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={profile.color === c}
              aria-label={`Color ${c}`}
              onClick={() => profile.color !== c && onUpdate(profile.id, { color: c })}
              className={cn(
                "size-7 border-2 border-neutral-900",
                profile.color === c && "ring-2 ring-neutral-900 ring-offset-2",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <dl className="grid grid-cols-4 border-2 border-neutral-900 text-center">
          {METRICS.map((m, i) => (
            <div key={m.key} className={cn("py-1", i > 0 && "border-l-2 border-neutral-900")}>
              <dt className={cn("text-[11px] font-bold uppercase", m.text)}>{m.short}</dt>
              <dd className="font-black tabular-nums">{profile.totals[m.key]}</dd>
            </div>
          ))}
        </dl>
        <p className="-mt-2 text-[11px] text-neutral-500">All-time totals</p>
      </Box>
    </li>
  );
}
