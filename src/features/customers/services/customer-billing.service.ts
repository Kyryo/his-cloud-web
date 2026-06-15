import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CustomerBillingCounts,
  CustomerBillingSummary,
  CustomerSalesOrdersResponse,
  FetchCustomerSalesOrdersOptions,
} from "@/features/customers/types/customer-billing.types";
import { bffRequest } from "@/lib/bff-client";

const SUMMARY_BILLING_QUERY =
  "?sales_limit=1&sales_offset=0&invoice_limit=1&invoice_offset=0&payment_limit=1&payment_offset=0";

const DEFAULT_SALES_ORDERS_LIMIT = 20;

export async function fetchCustomerBillingSummary(
  customerUuid: string,
): Promise<CustomerBillingSummary> {
  return bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}${SUMMARY_BILLING_QUERY}`,
  );
}

export async function fetchCustomerSalesOrders(
  customerUuid: string,
  options: FetchCustomerSalesOrdersOptions = {},
): Promise<CustomerSalesOrdersResponse> {
  const limit = options.limit ?? DEFAULT_SALES_ORDERS_LIMIT;
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    sales_limit: String(limit),
    sales_offset: String(offset),
    invoice_limit: "0",
    invoice_offset: "0",
    payment_limit: "0",
    payment_offset: "0",
  });

  const billing = await bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}?${params.toString()}`,
  );

  return {
    salesOrders: billing.sales_order_ids ?? [],
    pagination: billing.sales_orders_pagination,
    totals: billing.totals,
  };
}

export function extractCustomerBillingCounts(
  billing: CustomerBillingSummary,
): CustomerBillingCounts {
  return {
    salesOrders: billing.sales_orders_pagination.count,
    invoices: billing.invoices_pagination.count,
    payments: billing.payments_pagination.count,
  };
}

export function countOpenCustomerSalesOrders(
  orders: CustomerSalesOrdersResponse["salesOrders"],
): number {
  return orders.filter((order) => ["draft", "sent"].includes(order.state)).length;
}

export function countConfirmedCustomerSalesOrders(
  orders: CustomerSalesOrdersResponse["salesOrders"],
): number {
  return orders.filter((order) => ["sale", "done"].includes(order.state)).length;
}

export function countCancelledCustomerSalesOrders(
  orders: CustomerSalesOrdersResponse["salesOrders"],
): number {
  return orders.filter((order) => order.state === "cancel").length;
}
