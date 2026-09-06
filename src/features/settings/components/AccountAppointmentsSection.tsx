"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { fetchMyClinicianAppointments } from "@/features/appointments/services/appointments.service";
import type {
  Appointment,
  AppointmentStatus,
} from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { ROUTES } from "@/constants/routes";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
  rescheduled: "Rescheduled",
};

function appointmentMeta(appointment: Appointment) {
  return [
    appointment.clinic_name,
    appointment.department_name,
    formatDisplayDateTime(appointment.scheduled_start),
  ]
    .filter((value) => Boolean(value))
    .join(" · ");
}

function appointmentStatusLabel(status: Appointment["status"]) {
  return STATUS_LABELS[status] ?? status;
}

export function AccountAppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoadError(null);
        const response = await fetchMyClinicianAppointments({
          pageSize: 5,
          scheduledFrom: new Date().toISOString(),
        });
        if (!cancelled) {
          setAppointments(response.results);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load appointments.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-xl text-sm text-slate-400">
          Upcoming appointments assigned to you as the care provider.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.appointments}>View all</Link>
        </Button>
      </div>

      {isLoading ? (
        <SettingsContentSkeleton rows={3} showHeader={false} />
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-slate-400">
          Scheduled appointments where you are the assigned clinician will appear
          here.
        </p>
      ) : (
        <ul className="divide-y divide-brand-border">
          {appointments.map((appointment) => (
            <li
              key={appointment.uuid}
              className="flex flex-col gap-1 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-navy">
                  {appointment.patient_name}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-400">
                  {appointmentMeta(appointment)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {appointmentStatusLabel(appointment.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
