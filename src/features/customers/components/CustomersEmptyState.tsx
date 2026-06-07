import { Users } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type CustomersEmptyStateProps = {
  onAddClient: () => void;
};

export function CustomersEmptyState({ onAddClient }: CustomersEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="customers-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Users className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">No clients yet</h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Create your first client record to start managing registrations and activity.
      </p>
      <AddActionButton
        label="Add your first client"
        className="mt-6"
        onClick={onAddClient}
        data-testid="add-first-client-button"
      />
    </div>
  );
}
