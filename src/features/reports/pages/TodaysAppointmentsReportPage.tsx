"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageHeaderSection,
  ListPageLayout,
  ListPagePagination,
} from "@/features/app-shell/components/page-layout";
import { AppointmentDetailDialog } from "@/features/appointments/components/AppointmentDetailDialog";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import { fetchAppointments } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { TodaysAppointmentsBoard } from "@/features/reports/components/TodaysAppointmentsBoard";
import { TodaysAppointmentsBoardToolbar } from "@/features/reports/components/TodaysAppointmentsBoardToolbar";
import {
  type BoardGroupBy,
  type BoardStatusFilter,
  localTodayIso,
} from "@/features/reports/utils/todays-appointments-board";

function BoardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" data-testid="todays-appointments-skeleton">
      <div className="flex border-y border-dash-border/80">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[4.75rem] flex-1 border-r border-dash-border/60 last:border-r-0"
          />
        ))}
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-12 border-b border-dash-border/40" />
        ))}
      </div>
    </div>
  );
}

export function TodaysAppointmentsReportPage() {
  const today = useMemo(() => localTodayIso(), []);
  const { clinics, isLoading: isClinicsLoading } = useUserAssociatedClinics();
  const [clinicUuid, setClinicUuid] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BoardStatusFilter>("all");
  const [groupBy, setGroupBy] = useState<BoardGroupBy>("time");
  const [now, setNow] = useState(() => new Date());
  const [selectedAppointmentUuid, setSelectedAppointmentUuid] = useState<
    string | null
  >(null);

  const extraFilters = useMemo(
    () => ({
      scheduledFrom: today,
      scheduledTo: today,
      clinicUuid: clinicUuid === "all" ? undefined : clinicUuid,
      includeOutstandingBalance: true as const,
    }),
    [clinicUuid, today],
  );

  const list = useAppointmentsList<Appointment>({
    fetchFn: fetchAppointments,
    pageSize: 200,
    extraFilters,
    hasActiveFilters: clinicUuid !== "all",
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (list.isUnauthorized) {
    return (
      <InventoryListAccessDenied message="You are not authorized to view today's appointments report." />
    );
  }

  return (
    <ListPageLayout data-testid="todays-appointments-report-page">
      <ListPageHeaderSection>
        <TodaysAppointmentsBoardToolbar
          search={search}
          onSearchChange={setSearch}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          clinicUuid={clinicUuid}
          onClinicChange={(value) => {
            setClinicUuid(value);
            setStatusFilter("all");
            list.resetPage();
          }}
          clinics={clinics}
          isClinicsLoading={isClinicsLoading}
          onRefresh={() => void list.reload()}
          isRefreshing={list.isRefreshing || list.isLoading}
        />
      </ListPageHeaderSection>

      {list.isLoading ? (
        <BoardSkeleton />
      ) : list.error ? (
        <div className="border-y border-red-200 py-6">
          <h2 className="text-sm font-semibold text-red-800">
            Unable to load appointments
          </h2>
          <p className="mt-1 text-sm text-red-700">{list.error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void list.reload()}
          >
            Try again
          </Button>
        </div>
      ) : list.hasNoRecords || list.isFilteredEmpty ? (
        <p className="py-20 text-center text-sm text-dash-muted">
          {list.isFilteredEmpty
            ? "No appointments for this clinic today."
            : "Nothing is booked for today in clinics you can access."}
        </p>
      ) : (
        <>
          <TodaysAppointmentsBoard
            appointments={list.items}
            now={now}
            search={search}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            groupBy={groupBy}
            onSelectAppointment={(appointment) =>
              setSelectedAppointmentUuid(appointment.uuid)
            }
          />
          {list.totalCount > list.pageSize ? (
            <ListPagePagination
              page={list.page}
              pageSize={list.pageSize}
              totalCount={list.totalCount}
              hasNext={list.hasNext}
              hasPrevious={list.hasPrevious}
              isLoading={list.isRefreshing}
              onPageChange={list.handlePageChange}
            />
          ) : null}
        </>
      )}

      <AppointmentDetailDialog
        appointmentUuid={selectedAppointmentUuid}
        open={Boolean(selectedAppointmentUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppointmentUuid(null);
          }
        }}
        onUpdated={() => {
          void list.reload();
        }}
      />
    </ListPageLayout>
  );
}
