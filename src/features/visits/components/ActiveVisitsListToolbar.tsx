"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by client, identifier, or service..."
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
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
            Active filters:
          </span>

          {filters.clinicUuid ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onFiltersApply({ ...filters, clinicUuid: "" })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 transition-colors hover:bg-blue-100"
            >
              <span>Clinic: {clinicLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onFiltersApply(DEFAULT_ACTIVE_VISIT_FILTERS)}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
