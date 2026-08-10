"use client";

import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { useAppointmentsList } from "@/features/appointments/hooks/use-appointments-list";
import { useUserAssociatedClinics } from "@/features/appointments/hooks/use-user-associated-clinics";
import { fetchAppointments } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import {
  InventoryListPagination,
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";

function localTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TodaysAppointmentsReportPage() {
  const today = useMemo(() => localTodayIso(), []);
  const { clinics, isLoading: isClinicsLoading } = useUserAssociatedClinics();
  const [clinicUuid, setClinicUuid] = useState<string>("all");

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
    pageSize: 50,
    extraFilters,
    hasActiveFilters: clinicUuid !== "all",
  });

  const columns: InventoryListTableColumn<Appointment>[] = [
    {
      key: "scheduled_start",
      label: "Scheduled",
      render: (appointment) => formatDisplayDateTime(appointment.scheduled_start),
    },
    {
      key: "patient",
      label: "Client",
      cellClassName: "font-medium text-brand-navy",
      render: (appointment) => appointment.patient_name,
    },
    {
      key: "clinic",
      label: "Clinic",
      render: (appointment) => appointment.clinic_name || "—",
    },
    {
      key: "department",
      label: "Department",
      render: (appointment) => appointment.department_name || "—",
    },
    {
      key: "clinician",
      label: "Care provider",
      render: (appointment) => appointment.clinician_name || "Unassigned",
    },
    {
      key: "status",
      label: "Status",
      render: (appointment) => <AppointmentStatusBadge status={appointment.status} />,
    },
    {
      key: "outstanding_balance",
      label: "Outstanding balance",
      cellClassName: "text-right tabular-nums",
      headerClassName: "text-right",
      render: (appointment) =>
        formatInvoiceAmount(appointment.outstanding_balance ?? "0.00"),
    },
  ];

  if (list.isUnauthorized) {
    return (
      <InventoryListAccessDenied message="You are not authorized to view today's appointments report." />
    );
  }

  return (
    <ListPageLayout data-testid="todays-appointments-report-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Today's appointments"
            description={`Appointments for ${today} with client outstanding balances.`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={clinicUuid}
              onValueChange={setClinicUuid}
              disabled={isClinicsLoading}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All clinics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clinics</SelectItem>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.uuid} value={clinic.uuid}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => void list.reload()}
              disabled={list.isRefreshing || list.isLoading}
            >
              Refresh
            </Button>
          </div>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <InventoryListPageContent
        isLoading={list.isLoading}
        loadingMessage="Loading today's appointments…"
        error={list.error}
        onRetry={() => void list.reload()}
        errorTitle="Unable to load appointments"
        hasNoRecords={list.hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={CalendarDays}
            title="No appointments today"
            description="There are no appointments scheduled for today in clinics you can access."
          />
        }
        isFilteredEmpty={list.isFilteredEmpty}
        filteredEmptyTitle="No appointments for this clinic"
      >
        <div className="space-y-2">
          <InventoryListTable
            columns={columns}
            items={list.items}
            getRowKey={(row) => row.uuid}
          />
          <InventoryListPagination
            page={list.page}
            pageSize={list.pageSize}
            totalCount={list.totalCount}
            hasNext={list.hasNext}
            hasPrevious={list.hasPrevious}
            isLoading={list.isRefreshing}
            onPageChange={list.handlePageChange}
          />
        </div>
      </InventoryListPageContent>
    </ListPageLayout>
  );
}
