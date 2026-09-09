import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  BOARD_STATUS_LABELS,
  boardStatusAccentClass,
  formatAppointmentTimeRange,
  hasOutstandingBalance,
  parseOutstandingBalance,
} from "@/features/reports/utils/todays-appointments-board";
import { cn } from "@/lib/utils";

type TodaysAppointmentsBoardRowProps = {
  appointment: Appointment;
  onSelect: (appointment: Appointment) => void;
  hideProvider?: boolean;
  hideClinic?: boolean;
};

function metaLine(
  appointment: Appointment,
  options: { hideProvider?: boolean; hideClinic?: boolean },
): string {
  return [
    options.hideProvider
      ? null
      : appointment.clinician_name?.trim() || "Unassigned",
    appointment.department_name?.trim(),
    options.hideClinic ? null : appointment.clinic_name?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function TodaysAppointmentsBoardRow({
  appointment,
  onSelect,
  hideProvider = false,
  hideClinic = false,
}: TodaysAppointmentsBoardRowProps) {
  const due = hasOutstandingBalance(appointment);
  const inSession = appointment.status === "in_progress";

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment)}
      className="group relative grid w-full grid-cols-[5.75rem_minmax(0,1fr)_auto] items-start gap-3 py-2.5 pl-4 pr-1 text-left transition-colors hover:bg-dash-canvas/60 sm:gap-5 sm:py-3 sm:pl-5"
      data-testid={`todays-appointments-row-${appointment.uuid}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-2 left-0 w-0.5 rounded-full",
          boardStatusAccentClass(appointment.status),
          inSession && "inset-y-1.5",
        )}
      />
      <time
        dateTime={appointment.scheduled_start}
        className="pt-0.5 text-[13px] font-medium tabular-nums text-dash-muted"
      >
        {formatAppointmentTimeRange(
          appointment.scheduled_start,
          appointment.scheduled_end,
        )}
      </time>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-brand-navy group-hover:text-brand-primary">
          {appointment.patient_name}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-dash-muted">
          {metaLine(appointment, { hideProvider, hideClinic })}
        </span>
      </span>
      <span className="flex min-w-0 flex-col items-end gap-0.5 pt-0.5 text-right">
        <span
          className={cn(
            "text-[12px] font-medium",
            inSession ? "text-amber-700" : "text-dash-muted",
          )}
        >
          {BOARD_STATUS_LABELS[appointment.status] ?? appointment.status}
        </span>
        {due ? (
          <span className="text-[12px] font-medium tabular-nums text-amber-800">
            {formatInvoiceAmount(
              parseOutstandingBalance(appointment.outstanding_balance),
            )}
          </span>
        ) : null}
      </span>
    </button>
  );
}
