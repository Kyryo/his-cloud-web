import { BFF_CUSTOMER_ADDRESSES_ROUTES } from "@/constants/api";
import type {
  CreateCustomerAddressPayload,
  CustomerAddress,
  UpdateCustomerAddressPayload,
} from "@/features/customers/types/customer-address.types";
import type { PaginatedListResponse } from "@/types/api.types";
import { bffRequest } from "@/lib/bff-client";

export type CustomerAddressesListFilters = {
  customerId: number;
  page?: number;
  pageSize?: number;
};

function buildAddressesQuery(filters: CustomerAddressesListFilters): string {
  const params = new URLSearchParams();
  params.set("customer", String(filters.customerId));

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  params.set("ordering", "-is_primary,-created_at");

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomerAddresses(
  filters: CustomerAddressesListFilters,
): Promise<PaginatedListResponse<CustomerAddress>> {
  return bffRequest<PaginatedListResponse<CustomerAddress>>(
    `${BFF_CUSTOMER_ADDRESSES_ROUTES.list}${buildAddressesQuery(filters)}`,
  );
}

export async function createCustomerAddress(
  payload: CreateCustomerAddressPayload,
): Promise<CustomerAddress> {
  return bffRequest<CustomerAddress>(BFF_CUSTOMER_ADDRESSES_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateCustomerAddress(
  uuid: string,
  payload: UpdateCustomerAddressPayload,
): Promise<CustomerAddress> {
  return bffRequest<CustomerAddress>(BFF_CUSTOMER_ADDRESSES_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}
