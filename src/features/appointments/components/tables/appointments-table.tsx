"use client";

import { MoreHorizontal } from "lucide-react";

import { ClientAvatar } from "@/components/client-avatar";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { AppointmentTableAction } from "@/features/appointments/components/AppointmentActionConfirmDialog";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";

function canStartVisit(appointment: Appointment) {
  return ["scheduled", "confirmed"].includes(appointment.status);
}

function canConfirm(appointment: Appointment) {
  return appointment.status === "scheduled";
}

function canCancel(appointment: Appointment) {
  return ["scheduled", "confirmed"].includes(appointment.status);
}

type AppointmentsTableProps = {
  appointments: Appointment[];
  actionUuid: string | null;
  onRowClick: (appointment: Appointment) => void;
  onActionRequest: (
    appointment: Appointment,
    action: AppointmentTableAction,
  ) => void;
};

export const APPOINTMENT_TABLE_SKELETON_COLUMNS = [
  { key: "patient", label: "Client" },
  { key: "clinic", label: "Clinic" },
  { key: "department", label: "Department" },
  { key: "clinician", label: "Care provider", headerClassName: "hidden md:table-cell" },
  { key: "scheduled_start", label: "Scheduled" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

export function AppointmentsTable({
  appointments,
  actionUuid,
  onRowClick,
  onActionRequest,
}: AppointmentsTableProps) {
  const columns: InventoryListTableColumn<Appointment>[] = [
    {
      key: "patient",
      label: "Client",
      render: (appointment) => (
        <div className="flex min-w-0 items-center gap-3">
          <ClientAvatar name={appointment.patient_name} />
          <span className="truncate text-sm font-medium text-brand-navy">
            {appointment.patient_name}
          </span>
        </div>
      ),
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
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (appointment) => appointment.clinician_name || "Unassigned",
    },
    {
      key: "scheduled_start",
      label: "Scheduled",
      render: (appointment) => formatDisplayDateTime(appointment.scheduled_start),
    },
    {
      key: "status",
      label: "Status",
      render: (appointment) => <AppointmentStatusBadge status={appointment.status} />,
    },
    {
      key: "actions",
      label: "",
      cellClassName: "text-right",
      render: (appointment) => {
        const showOverflow = canConfirm(appointment) || canCancel(appointment);

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            {canStartVisit(appointment) ? (
              <SecondaryButton
                type="button"
                size="sm"
                onClick={() => onActionRequest(appointment, "start")}
                data-testid="appointments-start-visit"
              >
                Start visit
              </SecondaryButton>
            ) : null}

            {showOverflow ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-8 rounded-full"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {canConfirm(appointment) ? (
                    <DropdownMenuItem
                      disabled={actionUuid === appointment.uuid}
                      onClick={() => onActionRequest(appointment, "confirm")}
                    >
                      Confirm
                    </DropdownMenuItem>
                  ) : null}
                  {canCancel(appointment) ? (
                    <DropdownMenuItem
                      disabled={actionUuid === appointment.uuid}
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onActionRequest(appointment, "cancel")}
                    >
                      Cancel
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <InventoryListTable
      items={appointments}
      columns={columns}
      getRowKey={(appointment) => appointment.uuid}
      onRowClick={onRowClick}
    />
  );
}
