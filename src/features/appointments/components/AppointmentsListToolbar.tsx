"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Name, ID, phone, clinic, or department"
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

      {/* Active Filter Chips Bar */}
      {hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-muted mr-1">
            Active filters:
          </span>

          {hasStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveStatus}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span>Status: {statusLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasClinicFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveClinic}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Clinic filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasDepartmentFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveDepartment}
              className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 text-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span>Department filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasClinicianFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveClinician}
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/80 px-2.5 py-0.5 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span>Care provider filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasDateFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveDate}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span>Date range filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClearAllFilters}
            className="ml-1 text-[11px] font-medium text-brand-primary underline hover:text-brand-primary-hover transition-colors"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
