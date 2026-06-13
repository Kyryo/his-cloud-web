import {
  BFF_CUSTOMERS_ROUTES,
  BFF_VISITS_ROUTES,
} from "@/constants/api";
import type {
  CreateVisitPayload,
  FetchCustomerVisitsOptions,
  FetchVisitsOptions,
  StartVisitFromAppointmentPayload,
  VisitDetail,
  VisitEncounter,
  VisitEncounterCreatePayload,
} from "@/features/visits/types/visit.types";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

export type VisitEncounterAction = "start" | "complete" | "cancel";

export async function fetchVisits(
  options?: FetchVisitsOptions,
): Promise<PaginatedListResponse<VisitDetail>> {
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
  if (options?.status) {
    params.set("status", options.status);
  }
  if (options?.isActive !== undefined) {
    params.set("is_active", String(options.isActive));
  }
  if (options?.customerUuid) {
    params.set("customer_uuid", options.customerUuid);
  }
  if (options?.clinic) {
    params.set("clinic", options.clinic);
  }

  const suffix = params.toString();
  const path = suffix ? `${BFF_VISITS_ROUTES.list}?${suffix}` : BFF_VISITS_ROUTES.list;

  return bffRequest<PaginatedListResponse<VisitDetail>>(path);
}

export async function fetchCustomerVisits(
  customerUuid: string,
  options?: FetchCustomerVisitsOptions,
): Promise<VisitDetail[]> {
  return bffRequest<VisitDetail[]>(
    BFF_CUSTOMERS_ROUTES.visits(customerUuid, options),
  );
}

export async function createVisit(payload: CreateVisitPayload): Promise<VisitDetail> {
  return bffRequest<VisitDetail>(BFF_VISITS_ROUTES.create, {
    method: "POST",
    body: payload,
  });
}

export async function startVisitFromAppointment(
  appointmentUuid: string,
  payload: StartVisitFromAppointmentPayload,
): Promise<VisitDetail> {
  return bffRequest<VisitDetail>(BFF_VISITS_ROUTES.fromAppointment(appointmentUuid), {
    method: "POST",
    body: payload,
  });
}

export async function closeVisit(uuid: string): Promise<VisitDetail> {
  return bffRequest<VisitDetail>(BFF_VISITS_ROUTES.end(uuid), {
    method: "POST",
  });
}

export async function fetchVisit(uuid: string): Promise<VisitDetail> {
  return bffRequest<VisitDetail>(BFF_VISITS_ROUTES.detail(uuid));
}

export async function fetchVisitEncounters(uuid: string): Promise<VisitEncounter[]> {
  return bffRequest<VisitEncounter[]>(BFF_VISITS_ROUTES.encounters(uuid));
}

export async function createVisitEncounter(
  visitUuid: string,
  payload: VisitEncounterCreatePayload,
): Promise<VisitEncounter> {
  return bffRequest<VisitEncounter>(BFF_VISITS_ROUTES.encounters(visitUuid), {
    method: "POST",
    body: payload,
  });
}

export async function runVisitEncounterAction(
  visitUuid: string,
  encounterUuid: string,
  action: VisitEncounterAction,
): Promise<VisitEncounter> {
  const route =
    action === "start"
      ? BFF_VISITS_ROUTES.encounterStart(visitUuid, encounterUuid)
      : action === "complete"
        ? BFF_VISITS_ROUTES.encounterComplete(visitUuid, encounterUuid)
        : BFF_VISITS_ROUTES.encounterCancel(visitUuid, encounterUuid);

  return bffRequest<VisitEncounter>(route, { method: "POST" });
}

export function countVisits(visits: VisitDetail[]): number {
  return visits.length;
}

export function countActiveVisits(visits: VisitDetail[]): number {
  return visits.filter((visit) => visit.status === "active").length;
}

export function countCompletedVisits(visits: VisitDetail[]): number {
  return visits.filter((visit) => visit.status === "completed").length;
}

export function findActiveVisit(visits: VisitDetail[]): VisitDetail | null {
  return visits.find((visit) => visit.status === "active") ?? null;
}
