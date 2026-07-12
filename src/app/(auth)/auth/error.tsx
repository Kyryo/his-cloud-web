"use client";

import { StatusBanner } from "@/components/ui/status-banner";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="w-full max-w-md">
        <StatusBanner
          variant="error"
          message="Unable to load sign in"
          description={error.message || "Something went wrong. Try again later."}
        />
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
