"use client";

import { DetailPageNotFound } from "@/features/app-shell/components/page-layout";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DetailPageNotFound title="OPD queue unavailable" message={error.message}>
      <button
        type="button"
        className="mt-4 rounded-md border border-red-300 bg-white px-3 py-2 text-[13px]"
        onClick={reset}
      >
        Try again
      </button>
    </DetailPageNotFound>
  );
}
