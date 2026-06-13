import { Badge } from "@/components/ui/badge";
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

const variants: Record<
  AppointmentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  scheduled: "secondary",
  confirmed: "default",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
  no_show: "destructive",
  rescheduled: "secondary",
};

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus | string;
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const normalized = status as AppointmentStatus;

  return (
    <Badge variant={variants[normalized] ?? "secondary"}>
      {labels[normalized] ?? status}
    </Badge>
  );
}
