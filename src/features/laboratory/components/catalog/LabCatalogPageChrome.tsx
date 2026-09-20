"use client";

export { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
export { LabCatalogEmptyState as LabCatalogEmpty } from "@/features/laboratory/components/catalog/LabCatalogEmptyState";

type LabCatalogRowActionsProps = {
  onEdit: () => void;
  onDeactivate: () => void;
  isDeactivating?: boolean;
};

export function LabCatalogRowActions({
  onEdit,
  onDeactivate,
  isDeactivating = false,
}: LabCatalogRowActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <button
        type="button"
        className="text-[13px] font-medium text-brand-muted hover:text-brand-navy"
        data-testid="lab-catalog-edit-action"
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        Edit
      </button>
      <button
        type="button"
        className="text-[13px] font-medium text-brand-muted hover:text-red-600"
        disabled={isDeactivating}
        data-testid="lab-catalog-deactivate-action"
        onClick={(event) => {
          event.stopPropagation();
          onDeactivate();
        }}
      >
        {isDeactivating ? "Deactivating…" : "Deactivate"}
      </button>
    </div>
  );
}
