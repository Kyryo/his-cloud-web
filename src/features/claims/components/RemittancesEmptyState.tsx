import { Upload } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type RemittancesEmptyStateProps = {
  onUploadClick: () => void;
};

export function RemittancesEmptyState({
  onUploadClick,
}: RemittancesEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="remittances-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Upload className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        No remittances yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Upload a payer remittance file to reconcile settlements.
      </p>
      <AddActionButton
        label="Upload remittance"
        className="mt-6"
        onClick={onUploadClick}
        data-testid="upload-first-remittance-button"
      />
    </div>
  );
}
