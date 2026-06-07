import { BFF_CUSTOMER_NOTES_ROUTES } from "@/constants/api";
import type {
  CreateCustomerNotePayload,
  CustomerNote,
  UpdateCustomerNotePayload,
} from "@/features/customers/types/customer-note.types";
import type { PaginatedListResponse } from "@/types/api.types";
import { bffRequest } from "@/lib/bff-client";

export type CustomerNotesListFilters = {
  customerId: number;
  page?: number;
  pageSize?: number;
};

function buildNotesQuery(filters: CustomerNotesListFilters): string {
  const params = new URLSearchParams();
  params.set("customer", String(filters.customerId));

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCustomerNotes(
  filters: CustomerNotesListFilters,
): Promise<PaginatedListResponse<CustomerNote>> {
  return bffRequest<PaginatedListResponse<CustomerNote>>(
    `${BFF_CUSTOMER_NOTES_ROUTES.list}${buildNotesQuery(filters)}`,
  );
}

export async function createCustomerNote(
  payload: CreateCustomerNotePayload,
): Promise<CustomerNote> {
  return bffRequest<CustomerNote>(BFF_CUSTOMER_NOTES_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateCustomerNote(
  uuid: string,
  payload: UpdateCustomerNotePayload,
): Promise<CustomerNote> {
  return bffRequest<CustomerNote>(BFF_CUSTOMER_NOTES_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}
