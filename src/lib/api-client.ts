import type { MetricKey, DailyCount, Profile } from "@/types";

/** Typed browser-side wrapper around the REST API. */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error — check your connection.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return body as T;
}

export const api = {
  getCounts: (from: string, to: string) =>
    request<{ counts: DailyCount[] }>(`/api/counts?from=${from}&to=${to}`).then((r) => r.counts),

  adjustCount: (input: { profileId: string; date: string; metric: MetricKey; delta: number }) =>
    request<{ count: DailyCount }>("/api/counts", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.count),

  saveNote: (input: { profileId: string; date: string; note: string }) =>
    request<{ count: DailyCount }>("/api/notes", {
      method: "PUT",
      body: JSON.stringify(input),
    }).then((r) => r.count),

  createProfile: (input: { name: string; color?: string }) =>
    request<{ profile: Profile }>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.profile),

  updateProfile: (id: string, input: { name?: string; color?: string }) =>
    request<{ profile: Profile }>(`/api/profiles/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then((r) => r.profile),

  deleteProfile: (id: string) =>
    request<{ ok: true }>(`/api/profiles/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
