import { FileText } from "lucide-react";

export function InvoicesEmptyState() {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="invoices-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <FileText className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">No invoices yet</h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Invoices will appear here once sales orders are converted.
      </p>
    </div>
  );
}
