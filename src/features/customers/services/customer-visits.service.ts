import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchCustomerVisits(
  customerUuid: string,
): Promise<CustomerVisit[]> {
  return bffRequest<CustomerVisit[]>(BFF_CUSTOMERS_ROUTES.visits(customerUuid));
}

export function countCustomerVisits(visits: CustomerVisit[]): number {
  return visits.length;
}
