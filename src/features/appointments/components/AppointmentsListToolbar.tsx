"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
import { AppointmentsFiltersSheet } from "@/features/appointments/components/AppointmentsFiltersSheet";
import {
  AppointmentsViewToggle,
  type AppointmentsViewMode,
} from "@/features/appointments/components/AppointmentsViewToggle";
import type { AppointmentListFilterState } from "@/features/appointments/utils/appointment-list-filters";

type AppointmentsListToolbarProps = {
  search: string;
  filters: AppointmentListFilterState;
  viewMode: AppointmentsViewMode;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: AppointmentListFilterState) => void;
  onViewModeChange: (mode: AppointmentsViewMode) => void;
};

export function AppointmentsListToolbar({
  search,
  filters,
  viewMode,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onViewModeChange,
}: AppointmentsListToolbarProps) {
  return (
    <ListPageToolbarSection>
      <ListPageToolbarSearch>
        <Input
          id="appointments-search"
          type="search"
          placeholder="Search by name, ID, phone, clinic, or department..."
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="appointments-search"
        />

        <ListPageToolbarActions>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onSearchSubmit}
            data-testid="appointments-search-submit"
          >
            Search
          </Button>
          {search ? (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClearSearch}
            >
              Clear
            </Button>
          ) : null}
          <AppointmentsFiltersSheet
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        </ListPageToolbarActions>
      </ListPageToolbarSearch>

      <ListPageToolbarFilters>
        <AppointmentsViewToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}
