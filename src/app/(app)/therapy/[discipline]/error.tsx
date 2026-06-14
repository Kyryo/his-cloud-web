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
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-sm font-semibold text-red-800">
        Could not load therapy visits
      </h2>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
