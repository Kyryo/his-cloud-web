"use client";

import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { fetchTherapyFutureAppointments } from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyFutureAppointment,
} from "@/features/therapy/types/therapy.types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function FutureAppointmentsTab({
  discipline,
  visitUuid,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
}) {
  const [appointments, setAppointments] = useState<TherapyFutureAppointment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTherapyFutureAppointments(discipline, visitUuid)
      .then(setAppointments)
      .catch((fetchError: unknown) =>
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load appointments.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [discipline, visitUuid]);

  if (isLoading) {
    return <PageLoader message="Loading future appointments..." />;
  }
  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }
  if (appointments.length === 0) {
    return (
      <div className="py-10 text-center">
        <CalendarClock className="mx-auto size-8 text-brand-muted" />
        <h2 className="mt-3 font-semibold text-brand-navy">
          No future appointments
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          This client has no upcoming scheduled appointments.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-brand-navy">
        Future Appointments
      </h2>
      <div className="mt-5 divide-y divide-brand-border border-y border-brand-border">
        {appointments.map((appointment) => (
          <div
            key={appointment.uuid}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div>
              <p className="text-sm font-medium text-brand-navy">
                {appointment.department_name}
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                {DATE_FORMATTER.format(new Date(appointment.scheduled_start))}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                {appointment.clinician_name || "Clinician not assigned"}
                {appointment.location_name
                  ? ` - ${appointment.location_name}`
                  : ""}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {appointment.status.replace("_", " ")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
