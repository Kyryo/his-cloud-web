"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { fetchMyClinicianAppointments } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { ROUTES } from "@/constants/routes";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";

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
    <SettingsPanelSection
      title="Appointments"
      description="Upcoming appointments assigned to you as the care provider."
      action={
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.appointments}>View all</Link>
        </Button>
      }
    >
      {isLoading ? (
        <SettingsContentSkeleton rows={3} showHeader={false} />
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-brand-muted">
          Scheduled appointments where you are the assigned clinician will appear
          here.
        </p>
      ) : (
        <ul className="divide-y divide-brand-border">
          {appointments.map((appointment) => (
            <li
              key={appointment.uuid}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-navy">
                  {appointment.patient_name}
                </p>
                <p className="mt-0.5 text-xs text-brand-muted">
                  {appointment.clinic_name}
                  {appointment.department_name
                    ? ` · ${appointment.department_name}`
                    : ""}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  {formatDisplayDateTime(appointment.scheduled_start)}
                </p>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </li>
          ))}
        </ul>
      )}
    </SettingsPanelSection>
  );
}
