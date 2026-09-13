"use client";

import { BarChart3 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageBlankState,
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { AppointmentClinicEmptyState } from "@/features/appointments/components/AppointmentClinicEmptyState";
import {
  AppointmentActionConfirmDialog,
  type AppointmentTableAction,
} from "@/features/appointments/components/AppointmentActionConfirmDialog";
import { AppointmentDetailDialog } from "@/features/appointments/components/AppointmentDetailDialog";
import { AppointmentSummaryStatsCards } from "@/features/appointments/components/AppointmentSummaryStatsCards";
import { AppointmentsEmptyState } from "@/features/appointments/components/AppointmentsEmptyState";
import {
  AppointmentsDayPanel,
  type AppointmentCreateSchedulePrefill,
} from "@/features/appointments/components/AppointmentsDayPanel";
import { AppointmentsBoard } from "@/features/appointments/components/AppointmentsBoard";
import { AppointmentsBoardSkeleton } from "@/features/appointments/components/AppointmentsBoardSkeleton";
import { AppointmentsCalendarSkeleton } from "@/features/appointments/components/AppointmentsCalendarSkeleton";
import { AppointmentsMonthCalendar } from "@/features/appointments/components/AppointmentsMonthCalendar";
import { AppointmentsPageHeader } from "@/features/appointments/components/AppointmentsPageHeader";
import { AppointmentsTableSkeleton } from "@/features/appointments/components/AppointmentsTableSkeleton";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { AppointmentsTable } from "@/features/appointments/components/tables/appointments-table";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import { useAppointmentsRange } from "@/features/appointments/hooks/use-appointments-range";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import type { CreateAppointmentFormValues } from "@/features/appointments/schemas/appointment.schema";
import {
  fetchAppointmentSummaryStats,
  fetchAppointments,
  runAppointmentAction,
} from "@/features/appointments/services/appointments.service";
import type {
  Appointment,
  AppointmentSummaryStats,
} from "@/features/appointments/types/appointment.types";
import {
  countActiveAppointmentFilters,
  DEFAULT_APPOINTMENT_FILTERS,
  type AppointmentListFilterState,
} from "@/features/appointments/utils/appointment-list-filters";
import { useAppointmentBoardStore } from "@/features/appointments/stores/appointment-board.store";
import {
  APPOINTMENT_NEW_PARAM,
  appointmentsHref,
} from "@/features/appointments/utils/appointment-list-url";
import { parseAppointmentsViewFromPath } from "@/features/appointments/utils/appointment-views";
import { usePageActivity } from "@/features/app-shell/hooks/use-page-activity";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export function AppointmentsListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = parseAppointmentsViewFromPath(pathname);
  const { toast } = useToast();
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const urlCreate = searchParams.get(APPOINTMENT_NEW_PARAM) === "1";
  const isCreateOpen = createOpen || urlCreate;
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
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPanelOpen, setDayPanelOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<AppointmentSummaryStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

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
    enabled:
      (viewMode === "calendar" && hasAssignedClinic) || viewMode === "board",
  });

  const reloadStats = useCallback(async () => {
    try {
      const summary = await fetchAppointmentSummaryStats();
      setStats(summary);
    } catch {
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const summary = await fetchAppointmentSummaryStats();
        if (!cancelled) {
          setStats(summary);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setIsStatsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadAll = useCallback(async () => {
    await Promise.all([reloadList(), reloadCalendar(), reloadStats()]);
  }, [reloadCalendar, reloadList, reloadStats]);

  const handleAction = async (
    appointment: Appointment,
    action: "confirm" | "cancel" | "no-show",
  ) => {
    setActionUuid(appointment.uuid);

    try {
      await runAppointmentAction(appointment.uuid, action);
      useAppointmentBoardStore.getState().commit(appointment.uuid);
      toast({
        variant: "success",
        title: "Appointment updated",
        description:
          action === "confirm"
            ? "Appointment confirmed."
            : action === "no-show"
              ? "Marked as no show."
              : "Appointment cancelled.",
      });
      setPendingAction(null);
      await reloadAll();
    } catch (err) {
      useAppointmentBoardStore.getState().revert(appointment.uuid);
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
  const isBoardView = viewMode === "board";
  const isCalendarView = viewMode === "calendar";
  const activeError = isListView ? error : calendarError;
  const activeLoading = isListView
    ? isLoading
    : isCalendarView && !hasAssignedClinic
      ? false
      : isCalendarLoading;

  usePageActivity(
    !isUnauthorized &&
      (activeLoading ||
        isRefreshing ||
        ((isBoardView || isCalendarView) && isCalendarRefreshing)),
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <>
      <ListPageLayout
        data-testid="appointments-page"
        className={cn((isBoardView || isCalendarView) && "overflow-hidden sm:pb-3")}
      >
        <AppointmentsPageHeader
          search={search}
          filters={filters}
          viewMode={viewMode}
          isLoading={isRefreshing}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          onFiltersApply={(nextFilters) => {
            setFilters(nextFilters);
            resetPage();
          }}
          onNewAppointment={() => {
            setCreatePrefill(undefined);
            router.replace(appointmentsHref({ pathname, newAppointment: true }));
          }}
        />

        {isListView && !hasNoRecords ? (
          <FabButton
            label={showStats ? "Hide stats" : "Show stats"}
            icon={BarChart3}
            variant="outline"
            className="bottom-24 bg-white"
            onClick={() => setShowStats((current) => !current)}
            data-testid="appointments-show-stats-fab"
          />
        ) : null}

        <FabButton
          label="New appointment"
          onClick={() => {
            setCreatePrefill(undefined);
            router.replace(appointmentsHref({ pathname, newAppointment: true }));
          }}
          data-testid="new-appointment-fab"
        />

        {isListView && !hasNoRecords ? (
          <ListPageDataSectionsStack>
            <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
              <AppointmentSummaryStatsCards
                stats={stats}
                isLoading={isStatsLoading}
              />
            </ListPageStatsSection>
          </ListPageDataSectionsStack>
        ) : null}

        <ListPageTableSection
          className={cn(
            (isBoardView || isCalendarView) && "flex min-h-0 flex-1 flex-col",
          )}
        >
          {activeLoading ? (
            isListView ? (
              <AppointmentsTableSkeleton rows={8} />
            ) : isBoardView ? (
              <AppointmentsBoardSkeleton />
            ) : (
              <AppointmentsCalendarSkeleton visibleMonth={visibleMonth} />
            )
          ) : activeError ? (
            <ListPageBlankState
              compact
              tone="error"
              icon="calendarClock"
              title="Could not load appointments"
              description={activeError}
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg text-[13px]"
                  onClick={() => void reloadAll()}
                >
                  Try again
                </Button>
              }
            />
          ) : isListView && hasNoRecords ? (
            <AppointmentsEmptyState
              onNewAppointment={() => {
                setCreatePrefill(undefined);
                router.replace(
                  appointmentsHref({ pathname, newAppointment: true }),
                );
              }}
            />
          ) : isListView && isFilteredEmpty ? (
            <ListPageBlankState
              compact
              icon="search"
              title="No matching appointments"
              description="Adjust your search or filters and try again."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-lg text-[13px]"
                  onClick={handleClearSearch}
                >
                  Clear search and filters
                </Button>
              }
            />
          ) : isListView ? (
            <>
              <AppointmentsTable
                appointments={items}
                actionUuid={actionUuid}
                onRowClick={(appointment) =>
                  setSelectedAppointmentUuid(appointment.uuid)
                }
                onActionRequest={(appointment, action) =>
                  setPendingAction({ appointment, action })
                }
              />
              <ListPagePagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                isLoading={isRefreshing}
                onPageChange={handlePageChange}
              />
            </>
          ) : isBoardView ? (
            <AppointmentsBoard
              appointments={calendarAppointments}
              statusFilter={filters.status}
              onSelectAppointment={(appointment) =>
                setSelectedAppointmentUuid(appointment.uuid)
              }
              onActionRequest={(appointment, action) => {
                if (action === "confirm") {
                  void handleAction(appointment, "confirm");
                  return;
                }
                setPendingAction({ appointment, action });
              }}
            />
          ) : !hasAssignedClinic ? (
            <AppointmentClinicEmptyState className="rounded-2xl border border-dash-border bg-white py-16" />
          ) : (
            <Suspense
              fallback={
                <AppointmentsCalendarSkeleton visibleMonth={visibleMonth} />
              }
            >
              <AppointmentsMonthCalendar
                visibleMonth={visibleMonth}
                appointments={calendarAppointments}
                isLoading={isCalendarLoading || isCalendarRefreshing}
                onVisibleMonthChange={setVisibleMonth}
                onDaySelect={handleDaySelect}
                onAppointmentSelect={(appointment) =>
                  setSelectedAppointmentUuid(appointment.uuid)
                }
              />
            </Suspense>
          )}
        </ListPageTableSection>
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
        onActionRequest={(appointment, action) => {
          setSelectedAppointmentUuid(null);
          setPendingAction({ appointment, action });
        }}
      />

      <AppointmentActionConfirmDialog
        action={pendingAction?.action ?? null}
        appointment={pendingAction?.appointment ?? null}
        isSubmitting={Boolean(actionUuid)}
        onOpenChange={(open) => {
          if (!open) {
            if (pendingAction) {
              useAppointmentBoardStore.getState().revert(pendingAction.appointment.uuid);
            }
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
        open={isCreateOpen}
        initialSchedule={createPrefill}
        onOpenChange={(open) => {
          if (open) {
            setCreateOpen(true);
            return;
          }
          setCreateOpen(false);
          setCreatePrefill(undefined);
          if (urlCreate) {
            router.replace(pathname);
          }
        }}
        onCreated={() => {
          setCreateOpen(false);
          setCreatePrefill(undefined);
          if (urlCreate) {
            router.replace(pathname);
          }
          void reloadAll();
        }}
      />
    </>
  );
}
