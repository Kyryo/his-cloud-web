"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 py-10 sm:px-6">
      <h2 className="text-sm font-semibold text-brand-navy">Something went wrong</h2>
      <p className="mt-2 text-sm text-brand-muted">{error.message}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
