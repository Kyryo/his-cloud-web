"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-800">
        Encounter workspace unavailable
      </h1>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      <button
        type="button"
        className="mt-4 rounded-md border border-red-300 bg-white px-3 py-2 text-sm"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
