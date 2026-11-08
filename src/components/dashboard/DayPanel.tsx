"use client";

import { useState } from "react";
import { NoteSheet } from "@/components/dashboard/NoteSheet";
import { Box } from "@/components/ui/Box";
import { Modal } from "@/components/ui/Modal";
import { Stepper } from "@/components/ui/Stepper";
import { cn } from "@/lib/cn";
import { formatLongDate } from "@/lib/dates";
import { METRICS } from "@/lib/metrics";
import type { MetricKey, MetricValues, Profile } from "@/types";

interface DayPanelProps {
  date: string;
  isToday: boolean;
  profiles: Profile[];
  totals: MetricValues;
  getCounts: (profileId: string, date: string) => MetricValues;
  onAdjust: (profileId: string, date: string, metric: MetricKey, delta: number) => void;
  getNote: (profileId: string, date: string) => string;
  onSaveNote: (profileId: string, date: string, note: string) => Promise<boolean>;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
}

const navBtn =
  "grid size-10 shrink-0 place-items-center border-2 border-ink bg-surface text-lg font-bold hover:bg-surface-muted disabled:opacity-30";

export function DayPanel({
  date,
  isToday,
  profiles,
  totals,
  getCounts,
  onAdjust,
  getNote,
  onSaveNote,
  onPrev,
  onNext,
  onClose,
}: DayPanelProps) {
  // Notes live in a separate layer so the daily +/- flow stays uncluttered.
  const [noteFor, setNoteFor] = useState<Profile | null>(null);

  return (
    <>
      <Modal
        onClose={onClose}
        title={
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              {isToday ? "Today" : "Day"}
            </div>
            <h2 className="truncate text-base font-black sm:text-lg">{formatLongDate(date)}</h2>
          </div>
        }
        headerExtra={
          <div className="flex">
            <button
              type="button"
              className={navBtn}
              onClick={onPrev}
              disabled={!onPrev}
              aria-label="Previous day"
            >
              ‹
            </button>
            <button
              type="button"
              className={cn(navBtn, "-ml-[2px]")}
              onClick={onNext}
              disabled={!onNext}
              aria-label="Next day"
            >
              ›
            </button>
          </div>
        }
      >
        <div className="mb-3 grid grid-cols-4 border-2 border-ink bg-surface">
          {METRICS.map((m, i) => (
            <div key={m.key} className={cn("px-2 py-1.5 text-center", i > 0 && "border-l-2 border-ink")}>
              <div className={cn("text-[11px] font-bold uppercase", m.text)}>
                <span aria-hidden="true">{m.icon}</span> {m.short}
              </div>
              <div className="text-lg font-black tabular-nums">{totals[m.key]}</div>
            </div>
          ))}
        </div>

        <ul className="space-y-3">
          {profiles.map((p) => {
            const values = getCounts(p.id, date);
            const note = getNote(p.id, date);
            return (
              <li key={p.id}>
                <Box className="p-2 sm:p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="size-3.5 border-2 border-ink" style={{ backgroundColor: p.color }} />
                    <h3 className="min-w-0 flex-1 truncate font-bold">{p.name}</h3>
                    <button
                      type="button"
                      onClick={() => setNoteFor(p)}
                      aria-label={note ? `Edit note for ${p.name}` : `Add note for ${p.name}`}
                      title={note || "Add note"}
                      className={cn(
                        "relative -my-1 grid size-8 shrink-0 place-items-center text-sm transition hover:bg-surface-muted",
                        !note && "opacity-35 grayscale hover:opacity-100 hover:grayscale-0",
                      )}
                    >
                      <span aria-hidden="true">📝</span>
                      {note && (
                        <span className="absolute right-0.5 top-0.5 size-2 rounded-full border border-surface bg-amber-500" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {METRICS.map((m) => (
                      <Stepper
                        key={m.key}
                        label={m.label}
                        icon={m.icon}
                        value={values[m.key]}
                        headerClassName={m.header}
                        onChange={(delta) => onAdjust(p.id, date, m.key, delta)}
                      />
                    ))}
                  </div>
                </Box>
              </li>
            );
          })}
        </ul>
      </Modal>

      {noteFor && (
        <NoteSheet
          key={`${noteFor.id}|${date}`}
          profile={noteFor}
          date={date}
          initialNote={getNote(noteFor.id, date)}
          onSave={(note) => onSaveNote(noteFor.id, date, note)}
          onClose={() => setNoteFor(null)}
        />
      )}
    </>
  );
}
