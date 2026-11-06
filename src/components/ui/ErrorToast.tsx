"use client";

import { useEffect } from "react";

export function ErrorToast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 border-2 border-neutral-900 bg-red-100 px-3 py-2 text-sm font-semibold text-red-900 shadow-[3px_3px_0_0_#171717]"
    >
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} className="font-bold" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
