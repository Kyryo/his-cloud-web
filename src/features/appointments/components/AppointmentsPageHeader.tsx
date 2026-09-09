"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { AppointmentsListToolbar } from "@/features/appointments/components/AppointmentsListToolbar";
import type { AppointmentsViewMode } from "@/features/appointments/components/AppointmentsViewToggle";
import type { AppointmentListFilterState } from "@/features/appointments/utils/appointment-list-filters";

type AppointmentsPageHeaderProps = {
  search: string;
  filters: AppointmentListFilterState;
  viewMode: AppointmentsViewMode;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: AppointmentListFilterState) => void;
  onNewAppointment: () => void;
};

export function AppointmentsPageHeader({
  search,
  filters,
  viewMode,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onNewAppointment,
}: AppointmentsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <AppointmentsListToolbar
        search={search}
        filters={filters}
        viewMode={viewMode}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
            onClick={onNewAppointment}
            data-testid="new-appointment-button"
          >
            <AppIcon name="add" className="size-3.5" />
            <span>New Appointment</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
