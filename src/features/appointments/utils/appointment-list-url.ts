import { ROUTES } from "@/constants/routes";

export const APPOINTMENT_NEW_PARAM = "new";

export function appointmentsHref({
  pathname = ROUTES.appointments,
  newAppointment = false,
}: {
  pathname?: string;
  newAppointment?: boolean;
} = {}): string {
  if (!newAppointment) {
    return pathname;
  }

  const params = new URLSearchParams();
  params.set(APPOINTMENT_NEW_PARAM, "1");
  return `${pathname}?${params.toString()}`;
}
