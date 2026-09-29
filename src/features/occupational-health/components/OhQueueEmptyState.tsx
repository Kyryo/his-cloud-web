import { ClipboardList } from "lucide-react";

type OhQueueEmptyStateProps = {
  onRefresh: () => void;
};

export function OhQueueEmptyState({ onRefresh }: OhQueueEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="oh-queue-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <ClipboardList className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        No OH encounters in queue
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Active occupational health visits will appear here once clients are
        checked in and assigned to an occupational health department.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-lg border border-dash-border bg-white px-4 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
        onClick={onRefresh}
        data-testid="oh-queue-empty-refresh-button"
      >
        Refresh queue
      </button>
    </div>
  );
}
