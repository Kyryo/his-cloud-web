import { BFF_CUSTOMER_LEGAL_GUARDIANS_ROUTES } from "@/constants/api";
import type {
  CreateCustomerLegalGuardianPayload,
  CustomerLegalGuardian,
  UpdateCustomerLegalGuardianPayload,
} from "@/features/customers/types/customer-legal-guardian.types";
import type { PaginatedListResponse } from "@/types/api.types";
import { bffRequest } from "@/lib/bff-client";

export type CustomerLegalGuardiansListFilters = {
  customerId: number;
  page?: number;
  pageSize?: number;
  isActive?: boolean;
};

function buildLegalGuardiansQuery(
  filters: CustomerLegalGuardiansListFilters,
): string {
  const params = new URLSearchParams();
  params.set("customer", String(filters.customerId));

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  if (filters.isActive !== undefined) {
    params.set("is_active", filters.isActive ? "true" : "false");
  }

  params.set("ordering", "-is_primary,-created_at");

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomerLegalGuardians(
  filters: CustomerLegalGuardiansListFilters,
): Promise<PaginatedListResponse<CustomerLegalGuardian>> {
  return bffRequest<PaginatedListResponse<CustomerLegalGuardian>>(
    `${BFF_CUSTOMER_LEGAL_GUARDIANS_ROUTES.list}${buildLegalGuardiansQuery(filters)}`,
  );
}

export async function createCustomerLegalGuardian(
  payload: CreateCustomerLegalGuardianPayload,
): Promise<CustomerLegalGuardian> {
  return bffRequest<CustomerLegalGuardian>(
    BFF_CUSTOMER_LEGAL_GUARDIANS_ROUTES.list,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateCustomerLegalGuardian(
  uuid: string,
  payload: UpdateCustomerLegalGuardianPayload,
): Promise<CustomerLegalGuardian> {
  return bffRequest<CustomerLegalGuardian>(
    BFF_CUSTOMER_LEGAL_GUARDIANS_ROUTES.detail(uuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function voidCustomerLegalGuardian(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_CUSTOMER_LEGAL_GUARDIANS_ROUTES.detail(uuid), {
    method: "DELETE",
  });
}
