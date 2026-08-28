"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
    <ListPageSearchToolbar
      search={search}
      searchId="appointments-search"
      placeholder="Search by name, ID, phone, clinic, or department..."
      searchTestId="appointments-search"
      searchSubmitTestId="appointments-search-submit"
      clearTestId="appointments-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <AppointmentsFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
      trailing={
        <AppointmentsViewToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      }
    />
  );
}
