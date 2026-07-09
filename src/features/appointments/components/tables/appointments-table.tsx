"use client";

import { MoreHorizontal } from "lucide-react";

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
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-full border-brand-primary text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
                onClick={() => onActionRequest(appointment, "start")}
              >
                Start visit
              </Button>
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
