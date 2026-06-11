import type { ReactNode } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { ListPageTableSection } from "@/features/app-shell/components/page-layout";

type InventoryListPageContentProps = {
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onRetry: () => void;
  errorTitle: string;
  hasNoRecords: boolean;
  emptyState: ReactNode;
  isFilteredEmpty: boolean;
  filteredEmptyTitle?: string;
  children: ReactNode;
};

export function InventoryListPageContent({
  isLoading,
  loadingMessage,
  error,
  onRetry,
  errorTitle,
  hasNoRecords,
  emptyState,
  isFilteredEmpty,
  filteredEmptyTitle = "No matching records",
  children,
}: InventoryListPageContentProps) {
  return (
    <ListPageTableSection>
      {isLoading ? (
        <PageLoader message={loadingMessage} />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-sm font-semibold text-red-800">{errorTitle}</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : hasNoRecords ? (
        emptyState
      ) : isFilteredEmpty ? (
        <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-brand-navy">{filteredEmptyTitle}</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Adjust your search or filters and try again.
          </p>
        </div>
      ) : (
        children
      )}
    </ListPageTableSection>
  );
}
