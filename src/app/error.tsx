"use client";

import { useEffect } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-lg font-black">Something went wrong</h1>
      <p className="mt-1 text-sm text-ink-muted">
        The data could not be loaded. Check your internet connection and that <code>DATABASE_URL</code> is set,
        then try again.
      </p>
      <Button variant="primary" onClick={reset} className="mt-4">
        Try again
      </Button>
    </Box>
  );
}
