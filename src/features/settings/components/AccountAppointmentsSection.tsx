"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/features/appointments/components/AppointmentStatusBadge";
import { fetchMyClinicianAppointments } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { ROUTES } from "@/constants/routes";

export function AccountAppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
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
    <Card className="border-brand-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Appointments</CardTitle>
          <CardDescription>
            Upcoming appointments assigned to you as the care provider.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.appointments}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-brand-muted">Loading appointments...</p>
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : appointments.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-dashed border-brand-border px-4 py-6">
            <CalendarDays className="mt-0.5 size-5 text-brand-muted" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-brand-navy">No upcoming appointments</p>
              <p className="mt-1 text-sm text-brand-muted">
                Scheduled appointments where you are the assigned clinician will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border rounded-lg border border-brand-border">
            {appointments.map((appointment) => (
              <li
                key={appointment.uuid}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-navy">
                    {appointment.patient_name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {appointment.clinic_name}
                    {appointment.department_name ? ` · ${appointment.department_name}` : ""}
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
      </CardContent>
    </Card>
  );
}
