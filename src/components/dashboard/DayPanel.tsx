"use client";

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
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
}

const navBtn =
  "grid size-10 shrink-0 place-items-center border-2 border-neutral-900 bg-white text-lg font-bold hover:bg-neutral-100 disabled:opacity-30";

export function DayPanel({
  date,
  isToday,
  profiles,
  totals,
  getCounts,
  onAdjust,
  onPrev,
  onNext,
  onClose,
}: DayPanelProps) {
  return (
    <Modal
      onClose={onClose}
      title={
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">
            {isToday ? "Today" : "Day"}
          </div>
          <h2 className="truncate text-base font-black sm:text-lg">{formatLongDate(date)}</h2>
        </div>
      }
      headerExtra={
        <div className="flex">
          <button type="button" className={navBtn} onClick={onPrev} disabled={!onPrev} aria-label="Previous day">
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
      <div className="mb-3 grid grid-cols-4 border-2 border-neutral-900 bg-white">
        {METRICS.map((m, i) => (
          <div key={m.key} className={cn("px-2 py-1.5 text-center", i > 0 && "border-l-2 border-neutral-900")}>
            <div className={cn("text-[11px] font-bold uppercase", m.text)}>{m.short}</div>
            <div className="text-lg font-black tabular-nums">{totals[m.key]}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-3">
        {profiles.map((p) => {
          const values = getCounts(p.id, date);
          return (
            <li key={p.id}>
              <Box className="p-2 sm:p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="size-3.5 border-2 border-neutral-900" style={{ backgroundColor: p.color }} />
                  <h3 className="truncate font-bold">{p.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {METRICS.map((m) => (
                    <Stepper
                      key={m.key}
                      label={m.label}
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
  );
}
