"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import { ActiveVisitsFiltersSheet } from "@/features/visits/components/ActiveVisitsFiltersSheet";
import {
  countActiveVisitFilters,
  DEFAULT_ACTIVE_VISIT_FILTERS,
  type ActiveVisitListFilterState,
} from "@/features/visits/utils/visit-list-filters";
import { cn } from "@/lib/utils";

type ActiveVisitsListToolbarProps = {
  search: string;
  filters: ActiveVisitListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ActiveVisitListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function ActiveVisitsListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: ActiveVisitsListToolbarProps) {
  const { clinics } = useUserAssociatedClinics();
  const hasAnyFilter = countActiveVisitFilters(filters) > 0;
  const clinicLabel =
    clinics.find((clinic) => clinic.uuid === filters.clinicUuid)?.name ??
    "Clinic filtered";

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="active-visits-search"
        placeholder="Search by client, identifier, or service…"
        searchTestId="active-visits-search"
        searchSubmitTestId="active-visits-search-submit"
        clearTestId="active-visits-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <ActiveVisitsFiltersSheet
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={() => onFiltersApply(DEFAULT_ACTIVE_VISIT_FILTERS)}
        >
          {filters.clinicUuid ? (
            <ListPageFilterChip
              label={`Clinic: ${clinicLabel}`}
              disabled={isLoading}
              onRemove={() => onFiltersApply({ ...filters, clinicUuid: "" })}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}
