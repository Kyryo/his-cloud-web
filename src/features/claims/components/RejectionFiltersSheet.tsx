"use client";

import { useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Button } from "@/components/ui/button";
import { ListPageFilterButton } from "@/features/app-shell/components/page-layout";
import { REMITTANCE_PAYERS } from "@/features/claims/constants/remittance-payers";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  countActiveRejectionFilters,
  DEFAULT_REJECTION_LIST_FILTERS,
  type RejectionListFilterState,
} from "@/features/claims/utils/rejection-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const PAYER_FILTER_OPTIONS = [
  { value: "all", label: "All payers" },
  ...REMITTANCE_PAYERS.map((payer) => ({
    value: payer.code,
    label: payer.label,
  })),
];

type RejectionFiltersSheetProps = {
  filters: RejectionListFilterState;
  isLoading?: boolean;
  onApply: (filters: RejectionListFilterState) => void;
};

export function RejectionFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: RejectionFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(
    () => countActiveRejectionFilters(filters),
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
        data-testid="rejections-filters-button"
      />

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
          <SheetHeader>
            <SheetTitle>Filter rejections</SheetTitle>
            <SheetDescription>
              Narrow rejected remittance lines by payer.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSelectField
              id="rejection-filter-payer"
              label="Payer"
              value={draft.payerCode}
              options={PAYER_FILTER_OPTIONS}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  payerCode: value,
                }))
              }
            />
          </div>

          <SheetFooter className="mt-8 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setDraft(DEFAULT_REJECTION_LIST_FILTERS)}
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
              data-testid="rejections-filters-apply"
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
