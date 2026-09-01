"use client";

import { useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Button } from "@/components/ui/button";
import { ListPageFilterButton } from "@/features/app-shell/components/page-layout";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  countActiveRemittanceFilters,
  DEFAULT_REMITTANCE_LIST_FILTERS,
  type RemittanceListFilterState,
} from "@/features/claims/utils/remittance-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const REMITTANCE_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "queued", label: "Queued" },
  { value: "processing", label: "Processing" },
  { value: "processed", label: "Processed" },
  { value: "needs_review", label: "Needs review" },
  { value: "failed", label: "Failed" },
] as const;

type RemittanceFiltersSheetProps = {
  filters: RemittanceListFilterState;
  isLoading?: boolean;
  onApply: (filters: RemittanceListFilterState) => void;
};

export function RemittanceFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: RemittanceFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(
    () => countActiveRemittanceFilters(filters),
    [filters],
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  return (
    <>
      <ListPageFilterButton
        disabled={isLoading}
        activeCount={activeCount}
        onClick={() => handleOpenChange(true)}
        data-testid="remittances-filters-button"
      />

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
          <SheetHeader>
            <SheetTitle>Filter remittances</SheetTitle>
            <SheetDescription>
              Narrow the list by processing status.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSelectField
              id="remittance-filter-status"
              label="Status"
              value={draft.status}
              options={[...REMITTANCE_STATUS_OPTIONS]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  status: value as RemittanceListFilterState["status"],
                }))
              }
            />
          </div>

          <SheetFooter className="mt-8 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setDraft(DEFAULT_REMITTANCE_LIST_FILTERS)}
            >
              Reset
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
              data-testid="remittances-filters-apply"
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
