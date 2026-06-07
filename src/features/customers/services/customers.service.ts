import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CreateCustomerPayload,
  Customer,
  CustomerListFilters,
  CustomersListResponse,
  UpdateCustomerPayload,
} from "@/features/customers/types/customer.types";
import { bffRequest } from "@/lib/bff-client";

function buildCustomersQuery(filters: CustomerListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  if (filters.gender) {
    params.set("gender", filters.gender);
  }

  if (filters.hasSyncedToOdoo !== undefined) {
    params.set("has_synced_to_odoo", String(filters.hasSyncedToOdoo));
  }

  if (filters.isActive !== undefined) {
    params.set("is_active", String(filters.isActive));
  }

  if (filters.ordering) {
    params.set("ordering", filters.ordering);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomers(
  filters: CustomerListFilters = {},
): Promise<CustomersListResponse> {
  return bffRequest<CustomersListResponse>(
    `${BFF_CUSTOMERS_ROUTES.list}${buildCustomersQuery(filters)}`,
  );
}

export async function fetchCustomer(uuid: string): Promise<Customer> {
  return bffRequest<Customer>(BFF_CUSTOMERS_ROUTES.detail(uuid));
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  return bffRequest<Customer>(BFF_CUSTOMERS_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateCustomer(
  uuid: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  return bffRequest<Customer>(BFF_CUSTOMERS_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}
