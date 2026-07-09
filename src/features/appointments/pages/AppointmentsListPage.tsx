"use client";

import { CalendarClock } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { AppointmentClinicEmptyState } from "@/features/appointments/components/AppointmentClinicEmptyState";
import {
  AppointmentActionConfirmDialog,
  type AppointmentTableAction,
} from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { AppointmentDetailDialog } from "@/features/appointments/components/AppointmentDetailDialog";
import {
  AppointmentsDayPanel,
  type AppointmentCreateSchedulePrefill,
} from "@/features/appointments/components/AppointmentsDayPanel";
import { AppointmentsListToolbar } from "@/features/appointments/components/AppointmentsListToolbar";
import { AppointmentsMonthCalendar } from "@/features/appointments/components/AppointmentsMonthCalendar";
import type { AppointmentsViewMode } from "@/features/appointments/components/AppointmentsViewToggle";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { AppointmentsTable } from "@/features/appointments/components/tables/appointments-table";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import { useAppointmentsRange } from "@/features/appointments/hooks/use-appointments-range";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import type { CreateAppointmentFormValues } from "@/features/appointments/schemas/appointment.schema";
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
  const [createPrefill, setCreatePrefill] = useState<
    | (Partial<CreateAppointmentFormValues> & { clinicianName?: string | null })
    | undefined
  >(undefined);
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
  const [viewMode, setViewMode] = useState<AppointmentsViewMode>("list");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPanelOpen, setDayPanelOpen] = useState(false);

  const { primaryClinicUuid, hasAssignedClinic, clinics } = useUserAssociatedClinics();
  const calendarClinicUuid = filters.clinicUuid || primaryClinicUuid;
  const calendarClinicId = useMemo(
    () => clinics.find((clinic) => clinic.uuid === calendarClinicUuid)?.id ?? null,
    [calendarClinicUuid, clinics],
  );

  const extraFilters = useMemo(
    () => ({
      status: filters.status === "all" ? undefined : filters.status,
      clinicUuid: filters.clinicUuid || undefined,
      departmentUuid: filters.departmentUuid || undefined,
      ...(filters.clinicianId ? { clinicianId: filters.clinicianId } : {}),
      scheduledFrom: filters.scheduledFrom || undefined,
      scheduledTo: filters.scheduledTo || undefined,
    }),
    [filters],
  );

  const calendarExtraFilters = useMemo(
    () => ({
      ...extraFilters,
      ...(calendarClinicUuid ? { clinicUuid: calendarClinicUuid } : {}),
    }),
    [calendarClinicUuid, extraFilters],
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
    activeSearch,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    setSearch,
    handleSearchSubmit: submitListSearch,
    handleClearSearch,
    reload: reloadList,
    handlePageChange,
    resetPage,
  } = useAppointmentsList<Appointment>({
    fetchFn,
    extraFilters,
    hasActiveFilters,
    enabled: viewMode === "list",
  });

  const handleSearchSubmit = useCallback(() => {
    setViewMode("list");
    submitListSearch();
  }, [submitListSearch]);

  const {
    appointments: calendarAppointments,
    isLoading: isCalendarLoading,
    isRefreshing: isCalendarRefreshing,
    error: calendarError,
    reload: reloadCalendar,
  } = useAppointmentsRange({
    visibleMonth,
    extraFilters: calendarExtraFilters,
    search: activeSearch || undefined,
    enabled: viewMode === "calendar" && hasAssignedClinic,
  });

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadList(), reloadCalendar()]);
  }, [reloadCalendar, reloadList]);

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
      await reloadAll();
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

  const handleDaySelect = (day: Date) => {
    if (!hasAssignedClinic) {
      return;
    }

    setSelectedDay(day);
    setDayPanelOpen(true);
  };

  const handleCreateFromSlot = (prefill: AppointmentCreateSchedulePrefill) => {
    setCreatePrefill({
      clinic: prefill.clinic,
      department: prefill.department,
      clinician: prefill.clinician ?? null,
      clinicianName: prefill.clinicianName ?? null,
      scheduled_start: prefill.scheduled_start,
      scheduled_end: prefill.scheduled_end,
    });
    setDayPanelOpen(false);
    setCreateOpen(true);
  };

  const isListView = viewMode === "list";
  const activeError = isListView ? error : calendarError;
  const activeLoading = isListView
    ? isLoading
    : hasAssignedClinic
      ? isCalendarLoading
      : false;
  const activeRefreshing = isListView ? isRefreshing : isCalendarRefreshing;

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
          onAdd={() => {
            setCreatePrefill(undefined);
            setCreateOpen(true);
          }}
        />

        <ListPageDataSectionsStack className="space-y-2">
          <AppointmentsListToolbar
            search={search}
            filters={filters}
            viewMode={viewMode}
            isLoading={activeRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onViewModeChange={setViewMode}
            onFiltersApply={(nextFilters) => {
              setFilters(nextFilters);
              resetPage();
            }}
          />
        </ListPageDataSectionsStack>

        <InventoryListPageContent
          isLoading={activeLoading}
          loadingMessage="Loading appointments..."
          error={activeError}
          onRetry={() => void reloadAll()}
          errorTitle="Could not load appointments"
          hasNoRecords={isListView ? hasNoRecords : false}
          emptyState={
            <InventoryListEmptyState
              icon={CalendarClock}
              title="No appointments scheduled"
              description="Appointments booked for your clinics will appear here."
              actionLabel="New appointment"
              onAction={() => {
                setCreatePrefill(undefined);
                setCreateOpen(true);
              }}
              data-testid="appointments-empty-state"
            />
          }
          isFilteredEmpty={isListView ? isFilteredEmpty : false}
          filteredEmptyTitle="No matching appointments"
        >
          {isListView ? (
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
          ) : !hasAssignedClinic ? (
            <AppointmentClinicEmptyState className="rounded-2xl border border-brand-border bg-white py-16" />
          ) : (
            <AppointmentsMonthCalendar
              visibleMonth={visibleMonth}
              appointments={calendarAppointments}
              isLoading={isCalendarLoading || isCalendarRefreshing}
              onVisibleMonthChange={setVisibleMonth}
              onDaySelect={handleDaySelect}
            />
          )}
        </InventoryListPageContent>
      </ListPageLayout>

      <AppointmentsDayPanel
        day={selectedDay}
        open={dayPanelOpen}
        appointments={calendarAppointments}
        clinicUuid={calendarClinicUuid}
        clinicId={calendarClinicId}
        departmentUuid={filters.departmentUuid || undefined}
        initialClinicianId={filters.clinicianId}
        onOpenChange={setDayPanelOpen}
        onAppointmentSelect={(appointment) => {
          setDayPanelOpen(false);
          setSelectedAppointmentUuid(appointment.uuid);
        }}
        onCreateSlot={handleCreateFromSlot}
      />

      <AppointmentDetailDialog
        appointmentUuid={selectedAppointmentUuid}
        open={Boolean(selectedAppointmentUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentUuid(null);
          }
        }}
        onUpdated={() => void reloadAll()}
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
            void reloadAll();
          }}
        />
      ) : null}

      <CreateAppointmentDialog
        open={createOpen}
        initialSchedule={createPrefill}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreatePrefill(undefined);
          }
        }}
        onCreated={() => {
          setCreateOpen(false);
          setCreatePrefill(undefined);
          void reloadAll();
        }}
      />
    </>
  );
}
