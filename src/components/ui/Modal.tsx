"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  headerExtra?: ReactNode;
  /** "lg" for full panels, "sm" for small dialogs stacked on top of another modal. */
  size?: "lg" | "sm";
}

/** Open modals, innermost last — only the top one reacts to Escape. */
const openStack: symbol[] = [];

/** Bottom sheet on phones, centered dialog on larger screens. Supports stacking. */
export function Modal({ title, onClose, children, headerExtra, size = "lg" }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = Symbol("modal");
    openStack.push(id);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openStack[openStack.length - 1] === id) onCloseRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    // Keep focus on an autofocused field if there is one; otherwise focus Close.
    if (!dialogRef.current?.contains(document.activeElement)) closeRef.current?.focus();

    return () => {
      openStack.splice(openStack.indexOf(id), 1);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-end justify-center sm:items-center sm:p-6",
        size === "sm" ? "z-[55]" : "z-50",
      )}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col border-2 border-ink bg-page shadow-[4px_4px_0_0_var(--shadow)]",
          size === "sm" ? "sm:max-w-md" : "sm:max-w-3xl",
        )}
      >
        <div className="flex items-center gap-2 border-b-2 border-ink bg-surface px-3 py-2 sm:px-4">
          <div className="min-w-0 flex-1">{title}</div>
          {headerExtra}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center border-2 border-ink bg-surface text-xl font-bold hover:bg-surface-muted"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}
