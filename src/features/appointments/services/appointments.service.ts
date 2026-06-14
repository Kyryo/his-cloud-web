import { BFF_APPOINTMENTS_ROUTES } from "@/constants/api";
import type {
  Appointment,
  AppointmentAction,
  CareProvider,
  CreateAppointmentPayload,
  FetchAppointmentsOptions,
  FetchCareProvidersOptions,
  StartAppointmentVisitPayload,
  UpdateAppointmentPayload,
} from "@/features/appointments/types/appointment.types";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

function appendAppointmentQueryParams(
  params: URLSearchParams,
  options?: FetchAppointmentsOptions,
) {
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
    params.set("patient_uuid", options.patient);
  }
  if (options?.clinic || options?.clinicUuid) {
    params.set("clinic_uuid", options.clinicUuid ?? options.clinic ?? "");
  }
  if (options?.department || options?.departmentUuid) {
    params.set("department_uuid", options.departmentUuid ?? options.department ?? "");
  }
  if (options?.status) {
    params.set("status", options.status);
  }
  if (options?.scheduledFrom) {
    params.set("scheduled_from", options.scheduledFrom);
  }
  if (options?.scheduledTo) {
    params.set("scheduled_to", options.scheduledTo);
  }
  if (options?.isActive !== undefined) {
    params.set("is_active", String(options.isActive));
  }
}

export async function fetchAppointments(
  options?: FetchAppointmentsOptions,
): Promise<PaginatedListResponse<Appointment>> {
  const params = new URLSearchParams();
  appendAppointmentQueryParams(params, options);

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

export async function updateAppointment(
  uuid: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  return bffRequest<Appointment>(BFF_APPOINTMENTS_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
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

export async function fetchCareProviders(
  options?: FetchCareProvidersOptions,
): Promise<CareProvider[]> {
  const params = new URLSearchParams();

  if (options?.search?.trim()) {
    params.set("search", options.search.trim());
  }
  if (options?.clinic?.trim()) {
    params.set("clinic", options.clinic.trim());
  }

  const suffix = params.toString();
  const path = suffix
    ? `${BFF_APPOINTMENTS_ROUTES.careProviders}?${suffix}`
    : BFF_APPOINTMENTS_ROUTES.careProviders;

  const response = await bffRequest<{ results: CareProvider[] }>(path);
  return response.results;
}
