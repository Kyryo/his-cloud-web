"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  CustomerActiveFilter,
  CustomerListFilterState,
  CustomerOrdering,
  CustomerSyncFilter,
} from "@/features/customers/utils/customer-list-filters";
import {
  countActiveCustomerFilters,
  CUSTOMER_ORDERING_OPTIONS,
  DEFAULT_CUSTOMER_ORDERING,
} from "@/features/customers/utils/customer-list-filters";
import {
  ERP_SYNC_LABELS,
} from "@/features/customers/constants/customer-sync-labels";
import type { CustomerGender } from "@/features/customers/types/customer.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type CustomerFiltersSheetProps = {
  filters: Pick<
    CustomerListFilterState,
    "gender" | "syncStatus" | "activeStatus" | "ordering"
  >;
  isLoading?: boolean;
  onApply: (
    filters: Pick<
      CustomerListFilterState,
      "gender" | "syncStatus" | "activeStatus" | "ordering"
    >,
  ) => void;
};

const genderOptions: Array<{ value: CustomerGender | "all"; label: string }> = [
  { value: "all", label: "All genders" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const syncOptions: Array<{ value: CustomerSyncFilter; label: string }> = [
  { value: "all", label: "All sync statuses" },
  { value: "synced", label: ERP_SYNC_LABELS.filterSynced },
  { value: "not_synced", label: ERP_SYNC_LABELS.filterNotSynced },
];

const activeOptions: Array<{ value: CustomerActiveFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
];

export function CustomerFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: CustomerFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(() => countActiveCustomerFilters(filters), [filters]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    const reset = {
      gender: "all" as const,
      syncStatus: "all" as const,
      activeStatus: "all" as const,
      ordering: DEFAULT_CUSTOMER_ORDERING,
    };
    setDraft(reset);
    onApply(reset);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => handleOpenChange(true)}
        data-testid="customers-filters-button"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <SheetContent
        side="right"
        className={cn("w-full text-sm sm:max-w-md", appFont.className)}
      >
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-brand-navy">
            Filter clients
          </SheetTitle>
          <SheetDescription className="text-sm text-brand-muted">
            Narrow the list using the filters supported by the clients API.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-3">
          <FilterSelectField
            id="customer-filter-gender"
            label="Gender"
            value={draft.gender}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                gender: value as CustomerGender | "all",
              }))
            }
            options={genderOptions}
          />

          <FilterSelectField
            id="customer-filter-sync"
            label={ERP_SYNC_LABELS.filterLabel}
            value={draft.syncStatus}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                syncStatus: value as CustomerSyncFilter,
              }))
            }
            options={syncOptions}
          />

          <FilterSelectField
            id="customer-filter-active"
            label="Status"
            value={draft.activeStatus}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                activeStatus: value as CustomerActiveFilter,
              }))
            }
            options={activeOptions}
          />

          <FilterSelectField
            id="customer-filter-ordering"
            label="Sort by"
            value={draft.ordering}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                ordering: value as CustomerOrdering,
              }))
            }
            options={CUSTOMER_ORDERING_OPTIONS}
          />
        </div>

        <SheetFooter className="mt-8 gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset filters
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
