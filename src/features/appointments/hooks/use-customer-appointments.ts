import { useQuery } from "@tanstack/react-query";

import { fetchAppointments } from "@/features/appointments/services/appointments.service";
import type { Appointment } from "@/features/appointments/types/appointment.types";

export const customerAppointmentsQueryKey = (customerUuid: string) =>
  ["customer-appointments", customerUuid] as const;

/** Upcoming / active statuses surfaced in the OPD encounter aside. */
const ASIDE_APPOINTMENT_STATUSES = new Set([
  "scheduled",
  "confirmed",
  "in_progress",
]);

export function selectUpcomingAppointments(
  appointments: Appointment[],
  limit = 5,
): Appointment[] {
  return appointments
    .filter(
      (appointment) =>
        appointment.is_active !== false &&
        ASIDE_APPOINTMENT_STATUSES.has(appointment.status),
    )
    .sort(
      (left, right) =>
        new Date(left.scheduled_start).getTime() -
        new Date(right.scheduled_start).getTime(),
    )
    .slice(0, limit);
}

export function useCustomerAppointments(customerUuid: string | null | undefined) {
  return useQuery({
    queryKey: customerAppointmentsQueryKey(customerUuid ?? ""),
    queryFn: async () => {
      const response = await fetchAppointments({
        patient: customerUuid!,
        pageSize: 50,
        isActive: true,
      });
      return response.results;
    },
    enabled: Boolean(customerUuid),
    staleTime: 60_000,
  });
}
