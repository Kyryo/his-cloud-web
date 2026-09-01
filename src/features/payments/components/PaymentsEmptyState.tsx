import { Wallet } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type PaymentsEmptyStateProps = {
  onRecordPayment: () => void;
};

export function PaymentsEmptyState({ onRecordPayment }: PaymentsEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="payments-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Wallet className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">No payments yet</h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Payments will appear here once they are recorded against invoices.
      </p>
      <AddActionButton
        label="Record payment"
        className="mt-6"
        onClick={onRecordPayment}
        data-testid="record-first-payment-button"
      />
    </div>
  );
}
