"use client";

import { useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ListPageFilterButton } from "@/features/app-shell/components/page-layout";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import {
  countActiveVisitFilters,
  DEFAULT_ACTIVE_VISIT_FILTERS,
  type ActiveVisitListFilterState,
} from "@/features/visits/utils/visit-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ActiveVisitsFiltersSheetProps = {
  filters: ActiveVisitListFilterState;
  isLoading?: boolean;
  onApply: (filters: ActiveVisitListFilterState) => void;
};

export function ActiveVisitsFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: ActiveVisitsFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const { clinics } = useUserAssociatedClinics();
  const activeCount = useMemo(
    () => countActiveVisitFilters(filters),
    [filters],
  );

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
    setDraft(DEFAULT_ACTIVE_VISIT_FILTERS);
    onApply(DEFAULT_ACTIVE_VISIT_FILTERS);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <ListPageFilterButton
        disabled={isLoading}
        activeCount={activeCount}
        onClick={() => handleOpenChange(true)}
        data-testid="active-visits-filters-button"
      />

      <SheetContent
        side="right"
        className={cn("w-full text-sm sm:max-w-md", appFont.className)}
      >
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-brand-navy">
            Filter active visits
          </SheetTitle>
          <SheetDescription className="text-sm text-brand-muted">
            Narrow the queue by clinic.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-3">
          <FilterSelectField
            id="active-visit-filter-clinic"
            label="Clinic"
            value={draft.clinicUuid || "all"}
            disabled={isLoading}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                clinicUuid: value === "all" ? "" : value,
              }))
            }
            options={[
              { value: "all", label: "All clinics" },
              ...clinics.map((clinic) => ({
                value: clinic.uuid,
                label: clinic.name,
              })),
            ]}
          />
        </div>

        <SheetFooter className="mt-6 gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
