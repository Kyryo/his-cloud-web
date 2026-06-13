"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { ROUTES } from "@/constants/routes";

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
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onStartVisit: (appointment: Appointment) => void;
};

export function AppointmentsTable({
  appointments,
  actionUuid,
  onConfirm,
  onCancel,
  onStartVisit,
}: AppointmentsTableProps) {
  const columns: InventoryListTableColumn<Appointment>[] = [
    {
      key: "patient",
      label: "Client",
      cellClassName: "font-medium text-brand-navy",
      render: (appointment) => (
        <Link
          href={ROUTES.customerDetail(appointment.patient)}
          className="hover:text-brand-primary hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {appointment.patient_name}
        </Link>
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
      render: (appointment) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          {canConfirm(appointment) ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              disabled={actionUuid === appointment.uuid}
              onClick={() => onConfirm(appointment)}
            >
              Confirm
            </Button>
          ) : null}
          {canStartVisit(appointment) ? (
            <Button
              type="button"
              size="sm"
              className="h-8"
              onClick={() => onStartVisit(appointment)}
            >
              Start visit
            </Button>
          ) : null}
          {canCancel(appointment) ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-brand-muted hover:text-brand-navy"
              disabled={actionUuid === appointment.uuid}
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={appointments}
      columns={columns}
      getRowKey={(appointment) => appointment.uuid}
    />
  );
}
