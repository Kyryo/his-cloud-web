import { BFF_SALES_ORDERS_ROUTES } from "@/constants/api";
import type {
  SalesOrder,
  SalesOrderListFilters,
  SalesOrdersListResponse,
} from "@/features/sales-orders/types/sales-order.types";
import { bffRequest } from "@/lib/bff-client";

function buildSalesOrdersQuery(filters: SalesOrderListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }

  if (filters.name?.trim()) {
    params.set("name", filters.name.trim());
  }

  if (filters.state) {
    params.set("state", filters.state);
  }

  if (filters.invoiceStatus) {
    params.set("invoice_status", filters.invoiceStatus);
  }

  if (filters.dateFrom) {
    params.set("date_from", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("date_to", filters.dateTo);
  }

  if (filters.partnerId) {
    params.set("partner_id", String(filters.partnerId));
  }

  if (filters.visitId) {
    params.set("visit_id", String(filters.visitId));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchSalesOrders(
  filters: SalesOrderListFilters = {},
): Promise<SalesOrdersListResponse> {
  return bffRequest<SalesOrdersListResponse>(
    `${BFF_SALES_ORDERS_ROUTES.list}${buildSalesOrdersQuery(filters)}`,
  );
}

export async function fetchSalesOrder(orderId: number | string): Promise<SalesOrder> {
  return bffRequest<SalesOrder>(BFF_SALES_ORDERS_ROUTES.detail(orderId));
}
