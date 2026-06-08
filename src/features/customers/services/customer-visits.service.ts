import { BFF_CUSTOMERS_ROUTES, BFF_VISITS_ROUTES } from "@/constants/api";
import type {
  CreateVisitPayload,
  CustomerVisit,
  FetchCustomerVisitsOptions,
} from "@/features/customers/types/customer-visit.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchCustomerVisits(
  customerUuid: string,
  options?: FetchCustomerVisitsOptions,
): Promise<CustomerVisit[]> {
  return bffRequest<CustomerVisit[]>(
    BFF_CUSTOMERS_ROUTES.visits(customerUuid, options),
  );
}

export async function createCustomerVisit(
  payload: CreateVisitPayload,
): Promise<CustomerVisit> {
  return bffRequest<CustomerVisit>(BFF_VISITS_ROUTES.create, {
    method: "POST",
    body: payload,
  });
}

export async function closeCustomerVisit(uuid: string): Promise<CustomerVisit> {
  return bffRequest<CustomerVisit>(BFF_VISITS_ROUTES.end(uuid), {
    method: "POST",
  });
}

export function countCustomerVisits(visits: CustomerVisit[]): number {
  return visits.length;
}

export function countActiveCustomerVisits(visits: CustomerVisit[]): number {
  return visits.filter((visit) => visit.status === "active").length;
}

export function countCompletedCustomerVisits(visits: CustomerVisit[]): number {
  return visits.filter((visit) => visit.status === "completed").length;
}

export function findActiveCustomerVisit(
  visits: CustomerVisit[],
): CustomerVisit | null {
  return visits.find((visit) => visit.status === "active") ?? null;
}
