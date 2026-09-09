"use client";

import { MoreHorizontal } from "lucide-react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import type { AppointmentTableAction } from "@/features/appointments/components/AppointmentActionConfirmDialog";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import {
  canCancelAppointment,
  canConfirmAppointment,
  canStartAppointmentVisit,
} from "@/features/appointments/utils/appointment-action-availability";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

type AppointmentsTableProps = {
  appointments: Appointment[];
  actionUuid: string | null;
  onRowClick: (appointment: Appointment) => void;
  onActionRequest: (
    appointment: Appointment,
    action: AppointmentTableAction,
  ) => void;
  className?: string;
};

const columns = [
  { key: "patient", label: "Client" },
  { key: "clinic", label: "Clinic" },
  { key: "department", label: "Department" },
  { key: "clinician", label: "Care provider", className: "hidden md:table-cell" },
  { key: "scheduled_start", label: "Scheduled" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

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
  className,
}: AppointmentsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={"className" in column ? column.className : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {appointments.map((appointment) => {
          const showOverflow =
            canConfirmAppointment(appointment) || canCancelAppointment(appointment);

          return (
            <ListPageDataTableRow
              key={appointment.uuid}
              className="group cursor-pointer hover:bg-slate-50/70 transition-colors"
              onClick={() => onRowClick(appointment)}
            >
              {/* Client */}
              <ListPageDataTableCell className="py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserIdenticon
                    seed={appointment.patient || appointment.patient_name}
                    name={appointment.patient_name}
                    className="size-8.5 shrink-0 rounded-lg shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-brand-navy group-hover:text-brand-primary transition-colors">
                      {appointment.patient_name}
                    </span>
                    {appointment.reason ? (
                      <span className="block truncate text-sm text-brand-muted">
                        {appointment.reason}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>

              {/* Clinic */}
              <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
                {appointment.clinic_name || "—"}
              </ListPageDataTableCell>

              {/* Department */}
              <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
                {appointment.department_name || "—"}
              </ListPageDataTableCell>

              {/* Clinician */}
              <ListPageDataTableCell className="hidden py-3 text-sm text-brand-slate md:table-cell">
                {appointment.clinician_name || (
                  <span className="text-dash-muted">Unassigned</span>
                )}
              </ListPageDataTableCell>

              {/* Scheduled Start */}
              <ListPageDataTableCell className="py-3 text-sm font-medium text-brand-navy tabular-nums">
                {formatDisplayDateTime(appointment.scheduled_start)}
              </ListPageDataTableCell>

              {/* Status */}
              <ListPageDataTableCell className="py-3">
                <AppointmentStatusBadge status={appointment.status} />
              </ListPageDataTableCell>

              {/* Actions */}
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  {canStartAppointmentVisit(appointment) ? (
                    <SecondaryButton
                      type="button"
                      size="sm"
                      className="h-7 text-sm"
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
                          variant="ghost"
                          className="size-7.5 rounded-lg text-dash-muted hover:bg-slate-100 hover:text-brand-navy"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {canConfirmAppointment(appointment) ? (
                          <DropdownMenuItem
                            disabled={actionUuid === appointment.uuid}
                            onClick={() => onActionRequest(appointment, "confirm")}
                          >
                            Confirm
                          </DropdownMenuItem>
                        ) : null}
                        {canCancelAppointment(appointment) ? (
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
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
