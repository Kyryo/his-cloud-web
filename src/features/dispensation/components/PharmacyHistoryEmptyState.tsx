import { Pill } from "lucide-react";

export function PharmacyHistoryEmptyState() {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="pharmacy-history-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Pill className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">No dispensations yet</h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Completed pharmacy dispensations will appear here.
      </p>
    </div>
  );
}
