"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  headerExtra?: ReactNode;
}

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Modal({ title, onClose, children, headerExtra }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92dvh] w-full flex-col border-2 border-neutral-900 bg-neutral-50 shadow-[4px_4px_0_0_#171717] sm:max-w-3xl"
      >
        <div className="flex items-center gap-2 border-b-2 border-neutral-900 bg-white px-3 py-2 sm:px-4">
          <div className="min-w-0 flex-1">{title}</div>
          {headerExtra}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center border-2 border-neutral-900 bg-white text-xl font-bold hover:bg-neutral-100"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}
