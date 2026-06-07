import { BFF_CUSTOMER_ENCOUNTERS_ROUTES } from "@/constants/api";
import type {
  CustomerEncountersListFilters,
  CustomerEncountersListResponse,
} from "@/features/customers/types/customer-encounter.types";
import { bffRequest } from "@/lib/bff-client";

function buildEncountersQuery(
  filters: CustomerEncountersListFilters,
): string {
  const params = new URLSearchParams();
  params.set("customer", String(filters.customerId));

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  params.set("ordering", "-occurred_at");

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomerEncounters(
  filters: CustomerEncountersListFilters,
): Promise<CustomerEncountersListResponse> {
  return bffRequest<CustomerEncountersListResponse>(
    `${BFF_CUSTOMER_ENCOUNTERS_ROUTES.list}${buildEncountersQuery(filters)}`,
  );
}
