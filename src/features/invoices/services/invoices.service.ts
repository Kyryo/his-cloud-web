import { BFF_INVOICES_ROUTES } from "@/constants/api";
import type {
  Invoice,
  InvoiceListFilters,
  InvoiceListResponse,
} from "@/features/invoices/types/invoice.types";
import { bffRequest } from "@/lib/bff-client";

function buildInvoicesQuery(filters: InvoiceListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.name) {
    params.set("name", filters.name);
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.dateFrom) {
    params.set("date_from", filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set("date_to", filters.dateTo);
  }
  if (filters.customerId) {
    params.set("customer_id", String(filters.customerId));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchInvoices(
  filters: InvoiceListFilters = {},
): Promise<InvoiceListResponse> {
  return bffRequest<InvoiceListResponse>(
    `${BFF_INVOICES_ROUTES.list}${buildInvoicesQuery(filters)}`,
  );
}

export async function fetchInvoice(invoiceId: number | string): Promise<Invoice> {
  return bffRequest<Invoice>(BFF_INVOICES_ROUTES.detail(invoiceId));
}
