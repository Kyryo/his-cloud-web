"use client";

import { CalendarClock } from "lucide-react";
import { useCallback, useState } from "react";

import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { StartVisitFromAppointmentDialog } from "@/features/appointments/components/StartVisitFromAppointmentDialog";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { AppointmentsTable } from "@/features/appointments/components/tables/appointments-table";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import {
  fetchAppointments,
  runAppointmentAction,
} from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { useToast } from "@/providers/toast-provider";

export function AppointmentsListPage() {
  const { toast } = useToast();
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [startingAppointment, setStartingAppointment] = useState<Appointment | null>(
    null,
  );

  const fetchFn = useCallback(
    (filters: Parameters<typeof fetchAppointments>[0]) => fetchAppointments(filters),
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
  } = useAppointmentsList<Appointment>({ fetchFn });

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
          search={search}
          isSearchDisabled={isRefreshing}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          searchPlaceholder="Search by client, clinic, or department..."
        />

        {!hasNoRecords ? (
          <ListPageDataSectionsStack className="space-y-2">
            <InventoryListToolbar
              search={search}
              searchPlaceholder="Search by client, clinic, or department..."
              isLoading={isRefreshing}
              onSearchChange={setSearch}
              onSearchSubmit={handleSearchSubmit}
              onClearSearch={handleClearSearch}
              compact
            />
          </ListPageDataSectionsStack>
        ) : null}

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
              onConfirm={(appointment) => void handleAction(appointment, "confirm")}
              onCancel={(appointment) => void handleAction(appointment, "cancel")}
              onStartVisit={setStartingAppointment}
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
