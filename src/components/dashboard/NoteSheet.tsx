"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatLongDate } from "@/lib/dates";
import { NOTE_MAX_LENGTH } from "@/lib/constants";
import type { Profile } from "@/types";

interface NoteSheetProps {
  profile: Profile;
  date: string;
  initialNote: string;
  /** Resolves true when saved; errors are surfaced by the caller's toast. */
  onSave: (note: string) => Promise<boolean>;
  onClose: () => void;
}

/** Small dialog stacked over the day panel for an optional per-profile note. */
export function NoteSheet({ profile, date, initialNote, onSave, onClose }: NoteSheetProps) {
  const [text, setText] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const changed = text.trim() !== initialNote.trim();

  async function save(value: string) {
    if (saving) return;
    setSaving(true);
    const ok = await onSave(value);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal
      size="sm"
      onClose={onClose}
      title={
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
            <span aria-hidden="true">📝</span> Note · {formatLongDate(date)}
          </div>
          <h2 className="flex items-center gap-2 truncate font-black">
            <span className="size-3 shrink-0 border-2 border-ink" style={{ backgroundColor: profile.color }} />
            <span className="truncate">{profile.name}</span>
          </h2>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (changed) void save(text);
          else onClose();
        }}
        className="space-y-3"
      >
        <label htmlFor="note-text" className="sr-only">
          Note
        </label>
        <textarea
          id="note-text"
          autoFocus
          rows={5}
          value={text}
          maxLength={NOTE_MAX_LENGTH}
          disabled={saving}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) e.currentTarget.form?.requestSubmit();
          }}
          placeholder="e.g. Infosys — HR Priya, technical round Mon 11am"
          className="block w-full resize-y border-2 border-ink bg-surface p-3 text-sm outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-ink focus:ring-offset-1 focus:ring-offset-page"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-ink-muted">
            {text.length}/{NOTE_MAX_LENGTH}
          </span>
          <div className="ml-auto flex gap-2">
            {initialNote && (
              <Button variant="ghost" disabled={saving} onClick={() => void save("")}>
                Delete
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving…" : changed ? "Save" : "Done"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
