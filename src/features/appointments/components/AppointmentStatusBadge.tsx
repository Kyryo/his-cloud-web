import {
  StatusDotBadge,
  type StatusDotBadgeTone,
} from "@/components/ui/status-dot-badge";
import type { AppointmentStatus } from "@/features/appointments/types/appointment.types";

const labels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
  rescheduled: "Rescheduled",
};

const tones: Record<AppointmentStatus, StatusDotBadgeTone> = {
  scheduled: "neutral",
  confirmed: "info",
  in_progress: "success",
  completed: "primary",
  cancelled: "danger",
  no_show: "danger",
  rescheduled: "warning",
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus | string;
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const normalized = status as AppointmentStatus;

  return (
    <StatusDotBadge tone={tones[normalized] ?? "neutral"}>
      {labels[normalized] ?? status}
    </StatusDotBadge>
  );
}
