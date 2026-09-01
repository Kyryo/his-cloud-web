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
  countActiveClaimFilters,
  DEFAULT_CLAIM_LIST_FILTERS,
  type ClaimListFilterState,
  type ClaimStatusFilter,
} from "@/features/claims/utils/claim-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const CLAIM_STATUS_OPTIONS: { value: ClaimStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

type ClaimFiltersSheetProps = {
  filters: ClaimListFilterState;
  isLoading?: boolean;
  onApply: (filters: ClaimListFilterState) => void;
};

export function ClaimFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: ClaimFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(() => countActiveClaimFilters(filters), [filters]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <ListPageFilterButton
        disabled={isLoading}
        activeCount={activeCount}
        onClick={() => handleOpenChange(true)}
        data-testid="claims-filters-button"
      />

      <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
        <SheetHeader>
          <SheetTitle>Filter claims</SheetTitle>
          <SheetDescription>Narrow the list by claim status.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <FilterSelectField
            id="claim-filter-status"
            label="Status"
            value={draft.status}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                status: value as ClaimStatusFilter,
              }))
            }
            options={CLAIM_STATUS_OPTIONS}
          />
        </div>

        <SheetFooter className="mt-8 gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(DEFAULT_CLAIM_LIST_FILTERS);
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
