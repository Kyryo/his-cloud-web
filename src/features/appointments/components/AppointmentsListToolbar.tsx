"use client";

import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/list-search-input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
import { AppointmentsFiltersSheet } from "@/features/appointments/components/AppointmentsFiltersSheet";
import type { AppointmentListFilterState } from "@/features/appointments/utils/appointment-list-filters";

type AppointmentsListToolbarProps = {
  search: string;
  filters: AppointmentListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: AppointmentListFilterState) => void;
};

export function AppointmentsListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: AppointmentsListToolbarProps) {
  return (
    <ListPageToolbarSection>
      <ListPageToolbarSearch>
        <ListSearchInput
          id="appointments-search"
          placeholder="Search by client, clinic, or department..."
          value={search}
          disabled={isLoading}
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
            className="rounded-full"
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
              className="rounded-full"
              disabled={isLoading}
              onClick={onClearSearch}
            >
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>

      <ListPageToolbarFilters>
        <AppointmentsFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}
