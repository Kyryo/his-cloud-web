"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { AppointmentsFiltersSheet } from "@/features/appointments/components/AppointmentsFiltersSheet";
import {
  AppointmentsViewToggle,
  type AppointmentsViewMode,
} from "@/features/appointments/components/AppointmentsViewToggle";
import {
  APPOINTMENT_STATUS_OPTIONS,
  countActiveAppointmentFilters,
  DEFAULT_APPOINTMENT_FILTERS,
  type AppointmentListFilterState,
} from "@/features/appointments/utils/appointment-list-filters";
import { cn } from "@/lib/utils";

type AppointmentsListToolbarProps = {
  search: string;
  filters: AppointmentListFilterState;
  viewMode: AppointmentsViewMode;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: AppointmentListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
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
  trailing,
  className,
}: AppointmentsListToolbarProps) {
  const hasStatusFilter = filters.status !== "all";
  const hasClinicFilter = Boolean(filters.clinicUuid);
  const hasDepartmentFilter = Boolean(filters.departmentUuid);
  const hasClinicianFilter = Boolean(filters.clinicianId);
  const hasDateFilter = Boolean(filters.scheduledFrom || filters.scheduledTo);
  const hasAnyFilter = countActiveAppointmentFilters(filters) > 0;

  const statusLabel =
    APPOINTMENT_STATUS_OPTIONS.find((opt) => opt.value === filters.status)
      ?.label ?? filters.status;

  const handleRemoveStatus = () => {
    onFiltersApply({ ...filters, status: "all" });
  };

  const handleRemoveClinic = () => {
    onFiltersApply({ ...filters, clinicUuid: "", departmentUuid: "" });
  };

  const handleRemoveDepartment = () => {
    onFiltersApply({ ...filters, departmentUuid: "" });
  };

  const handleRemoveClinician = () => {
    onFiltersApply({ ...filters, clinicianId: null });
  };

  const handleRemoveDate = () => {
    onFiltersApply({ ...filters, scheduledFrom: "", scheduledTo: "" });
  };

  const handleClearAllFilters = () => {
    onFiltersApply(DEFAULT_APPOINTMENT_FILTERS);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="appointments-search"
        placeholder="Name, ID, phone, clinic, or department…"
        searchTestId="appointments-search"
        searchSubmitTestId="appointments-search-submit"
        clearTestId="appointments-search-clear"
        isLoading={isLoading}
        showSearchButton={false}
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
          <div className="flex items-center gap-3">
            <AppointmentsViewToggle viewMode={viewMode} />
            {trailing}
          </div>
        }
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={handleClearAllFilters}
        >
          {hasStatusFilter ? (
            <ListPageFilterChip
              label={`Status: ${statusLabel}`}
              disabled={isLoading}
              onRemove={handleRemoveStatus}
            />
          ) : null}
          {hasClinicFilter ? (
            <ListPageFilterChip
              label="Clinic filtered"
              disabled={isLoading}
              onRemove={handleRemoveClinic}
            />
          ) : null}
          {hasDepartmentFilter ? (
            <ListPageFilterChip
              label="Department filtered"
              disabled={isLoading}
              onRemove={handleRemoveDepartment}
            />
          ) : null}
          {hasClinicianFilter ? (
            <ListPageFilterChip
              label="Care provider filtered"
              disabled={isLoading}
              onRemove={handleRemoveClinician}
            />
          ) : null}
          {hasDateFilter ? (
            <ListPageFilterChip
              label="Date range filtered"
              disabled={isLoading}
              onRemove={handleRemoveDate}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}
