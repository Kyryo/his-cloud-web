import type {
  Appointment,
  AppointmentStatus,
} from "@/features/appointments/types/appointment.types";
import type { AppointmentStatusFilter } from "@/features/appointments/utils/appointment-list-filters";

export const APPOINTMENT_BOARD_COLUMNS: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
];

export const APPOINTMENT_BOARD_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
  rescheduled: "Rescheduled",
};

export const APPOINTMENT_BOARD_ACCENT: Record<AppointmentStatus, string> = {
  scheduled: "bg-slate-400",
  confirmed: "bg-brand-primary",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
  no_show: "bg-rose-500",
  rescheduled: "bg-violet-400",
};

export type AppointmentBoardColumn = {
  status: AppointmentStatus;
  label: string;
  appointments: Appointment[];
};

const BOARD_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const BOARD_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

function compareByStart(left: Appointment, right: Appointment): number {
  return (
    new Date(left.scheduled_start).getTime() -
    new Date(right.scheduled_start).getTime()
  );
}

export function formatBoardAppointmentWhen(startIso: string): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) {
    return "—";
  }

  return `${BOARD_DATE_FORMAT.format(start)} · ${BOARD_TIME_FORMAT.format(start)}`;
}

export function groupAppointmentsByStatus(
  appointments: Appointment[],
  statusFilter: AppointmentStatusFilter = "all",
): AppointmentBoardColumn[] {
  const visibleStatuses =
    statusFilter === "all" ? APPOINTMENT_BOARD_COLUMNS : [statusFilter];
  const grouped = new Map<AppointmentStatus, Appointment[]>();

  for (const status of visibleStatuses) {
    grouped.set(status, []);
  }

  for (const appointment of appointments) {
    const bucket = grouped.get(appointment.status);
    if (!bucket) {
      continue;
    }
    bucket.push(appointment);
  }

  return visibleStatuses.map((status) => ({
    status,
    label: APPOINTMENT_BOARD_LABELS[status],
    appointments: (grouped.get(status) ?? []).toSorted(compareByStart),
  }));
}
