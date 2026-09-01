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
  countActiveRemittanceRowFilters,
  DEFAULT_REMITTANCE_ROW_LIST_FILTERS,
  REMITTANCE_ROW_STATUS_FILTER_OPTIONS,
  type RemittanceRowListFilterState,
} from "@/features/claims/utils/remittance-row-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type RemittanceRowsFiltersSheetProps = {
  filters: RemittanceRowListFilterState;
  isLoading?: boolean;
  onApply: (filters: RemittanceRowListFilterState) => void;
};

export function RemittanceRowsFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: RemittanceRowsFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(
    () => countActiveRemittanceRowFilters(filters),
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
        data-testid="remittance-rows-filters-button"
      />

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
          <SheetHeader>
            <SheetTitle>Filter line items</SheetTitle>
            <SheetDescription>
              Narrow remittance lines by resolution status.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSelectField
              id="remittance-row-filter-status"
              label="Resolution status"
              value={draft.resolutionStatus}
              options={[...REMITTANCE_ROW_STATUS_FILTER_OPTIONS]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  resolutionStatus:
                    value as RemittanceRowListFilterState["resolutionStatus"],
                }))
              }
            />
          </div>

          <SheetFooter className="mt-8 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setDraft(DEFAULT_REMITTANCE_ROW_LIST_FILTERS)}
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
              data-testid="remittance-rows-filters-apply"
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
