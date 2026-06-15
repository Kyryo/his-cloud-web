"use client";

import { CalendarClock } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import {
  AppointmentActionConfirmDialog,
  type AppointmentTableAction,
} from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { AppointmentDetailDialog } from "@/features/appointments/components/AppointmentDetailDialog";
import { AppointmentsListToolbar } from "@/features/appointments/components/AppointmentsListToolbar";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { AppointmentsTable } from "@/features/appointments/components/tables/appointments-table";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import {
  fetchAppointments,
  runAppointmentAction,
} from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  countActiveAppointmentFilters,
  DEFAULT_APPOINTMENT_FILTERS,
  type AppointmentListFilterState,
} from "@/features/appointments/utils/appointment-list-filters";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { useToast } from "@/providers/toast-provider";

export function AppointmentsListPage() {
  const { toast } = useToast();
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAppointmentUuid, setSelectedAppointmentUuid] = useState<
    string | null
  >(null);
  const [startingAppointment, setStartingAppointment] = useState<Appointment | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<{
    appointment: Appointment;
    action: AppointmentTableAction;
  } | null>(null);
  const [filters, setFilters] = useState<AppointmentListFilterState>(
    DEFAULT_APPOINTMENT_FILTERS,
  );

  const extraFilters = useMemo(
    () => ({
      status: filters.status === "all" ? undefined : filters.status,
      clinicUuid: filters.clinicUuid || undefined,
      departmentUuid: filters.departmentUuid || undefined,
      scheduledFrom: filters.scheduledFrom || undefined,
      scheduledTo: filters.scheduledTo || undefined,
    }),
    [filters],
  );

  const hasActiveFilters = countActiveAppointmentFilters(filters) > 0;

  const fetchFn = useCallback(
    (listFilters: Parameters<typeof fetchAppointments>[0]) =>
      fetchAppointments(listFilters),
    [],
  );

  const {
    items,
    totalCount,
    page,
    pageSize,
    search,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    reload,
    handlePageChange,
    resetPage,
  } = useAppointmentsList<Appointment>({
    fetchFn,
    extraFilters,
    hasActiveFilters,
  });

  const handleAction = async (
    appointment: Appointment,
    action: "confirm" | "cancel",
  ) => {
    setActionUuid(appointment.uuid);

    try {
      await runAppointmentAction(appointment.uuid, action);
      toast({
        variant: "success",
        title: "Appointment updated",
        description:
          action === "confirm" ? "Appointment confirmed." : "Appointment cancelled.",
      });
      setPendingAction(null);
      await reload();
    } catch (err) {
      toast({
        variant: "error",
        title: "Action could not be completed",
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setActionUuid(null);
    }
  };

  const handleConfirmPendingAction = () => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.action === "start") {
      setStartingAppointment(pendingAction.appointment);
      setPendingAction(null);
      return;
    }

    void handleAction(pendingAction.appointment, pendingAction.action);
  };

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <>
      <ListPageLayout className="space-y-4" data-testid="appointments-page">
        <InventoryListPageHeader
          title="Appointments"
          description="Scheduled visits across your clinics. Confirm, start visits, or manage cancellations."
          addLabel="New appointment"
          onAdd={() => setCreateOpen(true)}
        />

        <ListPageDataSectionsStack className="space-y-2">
          <AppointmentsListToolbar
            search={search}
            filters={filters}
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onFiltersApply={(nextFilters) => {
              setFilters(nextFilters);
              resetPage();
            }}
          />
        </ListPageDataSectionsStack>

        <InventoryListPageContent
          isLoading={isLoading}
          loadingMessage="Loading appointments..."
          error={error}
          onRetry={() => void reload()}
          errorTitle="Could not load appointments"
          hasNoRecords={hasNoRecords}
          emptyState={
            <InventoryListEmptyState
              icon={CalendarClock}
              title="No appointments scheduled"
              description="Appointments booked for your clinics will appear here."
              actionLabel="New appointment"
              onAction={() => setCreateOpen(true)}
              data-testid="appointments-empty-state"
            />
          }
          isFilteredEmpty={isFilteredEmpty}
          filteredEmptyTitle="No matching appointments"
        >
          <div className="space-y-2">
            <AppointmentsTable
              appointments={items}
              actionUuid={actionUuid}
              onRowClick={(appointment) => setSelectedAppointmentUuid(appointment.uuid)}
              onActionRequest={(appointment, action) =>
                setPendingAction({ appointment, action })
              }
            />
            <InventoryListPagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={handlePageChange}
            />
          </div>
        </InventoryListPageContent>
      </ListPageLayout>

      <AppointmentDetailDialog
        appointmentUuid={selectedAppointmentUuid}
        open={Boolean(selectedAppointmentUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentUuid(null);
          }
        }}
        onUpdated={() => void reload()}
      />

      <AppointmentActionConfirmDialog
        action={pendingAction?.action ?? null}
        appointment={pendingAction?.appointment ?? null}
        isSubmitting={Boolean(actionUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
        onConfirm={handleConfirmPendingAction}
      />

      {startingAppointment ? (
        <StartVisitFromAppointmentDialog
          appointment={startingAppointment}
          patientUuid={startingAppointment.patient}
          open={Boolean(startingAppointment)}
          onOpenChange={(open) => {
            if (!open) {
              setStartingAppointment(null);
            }
          }}
          onStarted={() => {
            setStartingAppointment(null);
            void reload();
          }}
        />
      ) : null}

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          void reload();
        }}
      />
    </>
  );
}
