import { BFF_APPOINTMENTS_ROUTES } from "@/constants/api";
import type {
  Appointment,
  AppointmentAction,
  CreateAppointmentPayload,
  FetchAppointmentsOptions,
  StartAppointmentVisitPayload,
} from "@/features/appointments/types/appointment.types";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

export async function fetchAppointments(
  options?: FetchAppointmentsOptions,
): Promise<PaginatedListResponse<Appointment>> {
  const params = new URLSearchParams();

  if (options?.page) {
    params.set("page", String(options.page));
  }
  if (options?.pageSize) {
    params.set("page_size", String(options.pageSize));
  }
  if (options?.search) {
    params.set("search", options.search);
  }
  if (options?.patient) {
    params.set("patient", options.patient);
  }
  if (options?.clinic) {
    params.set("clinic", options.clinic);
  }
  if (options?.department) {
    params.set("department", options.department);
  }
  if (options?.status) {
    params.set("status", options.status);
  }

  const suffix = params.toString();
  const path = suffix
    ? `${BFF_APPOINTMENTS_ROUTES.list}?${suffix}`
    : BFF_APPOINTMENTS_ROUTES.list;

  return bffRequest<PaginatedListResponse<Appointment>>(path);
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  return bffRequest<Appointment>(BFF_APPOINTMENTS_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function fetchAppointment(uuid: string): Promise<Appointment> {
  return bffRequest<Appointment>(BFF_APPOINTMENTS_ROUTES.detail(uuid));
}

export async function runAppointmentAction(
  uuid: string,
  action: AppointmentAction,
  body?: { reason?: string },
): Promise<Appointment | { visit: VisitDetail; encounter: unknown }> {
  const route =
    action === "confirm"
      ? BFF_APPOINTMENTS_ROUTES.confirm(uuid)
      : action === "cancel"
        ? BFF_APPOINTMENTS_ROUTES.cancel(uuid)
        : action === "no-show"
          ? BFF_APPOINTMENTS_ROUTES.noShow(uuid)
          : BFF_APPOINTMENTS_ROUTES.start(uuid);

  return bffRequest(route, {
    method: "POST",
    body: body ?? {},
  });
}

export async function startAppointmentVisit(
  uuid: string,
  payload: StartAppointmentVisitPayload,
): Promise<{ visit: VisitDetail; encounter: unknown } | VisitDetail> {
  return runAppointmentAction(uuid, "start", payload) as Promise<
    { visit: VisitDetail; encounter: unknown } | VisitDetail
  >;
}
