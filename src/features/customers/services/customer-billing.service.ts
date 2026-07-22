import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CustomerBillingCounts,
  CustomerBillingSummary,
  CustomerInvoicesResponse,
  CustomerPaymentsResponse,
  CustomerSalesOrdersResponse,
  FetchCustomerBillingListOptions,
} from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
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

export async function updateCustomerOpeningBalance(
  customerUuid: string,
  openingBalance: string,
): Promise<Customer> {
  return bffRequest<Customer>(BFF_CUSTOMERS_ROUTES.openingBalance(customerUuid), {
    method: "PATCH",
    body: { opening_balance: openingBalance },
  });
}

function buildBillingQuery(
  options: FetchCustomerBillingListOptions,
  section: "sales" | "invoices" | "payments",
): string {
  const limit = options.limit ?? DEFAULT_SALES_ORDERS_LIMIT;
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    sales_limit: section === "sales" ? String(limit) : "0",
    sales_offset: section === "sales" ? String(offset) : "0",
    invoice_limit: section === "invoices" ? String(limit) : "0",
    invoice_offset: section === "invoices" ? String(offset) : "0",
    payment_limit: section === "payments" ? String(limit) : "0",
    payment_offset: section === "payments" ? String(offset) : "0",
  });
  return params.toString();
}

export async function fetchCustomerSalesOrders(
  customerUuid: string,
  options: FetchCustomerBillingListOptions = {},
): Promise<CustomerSalesOrdersResponse> {
  const billing = await bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}?${buildBillingQuery(options, "sales")}`,
  );

  return {
    salesOrders: billing.sales_orders ?? [],
    pagination: billing.sales_orders_pagination,
    totals: billing.totals,
  };
}

export async function fetchCustomerInvoices(
  customerUuid: string,
  options: FetchCustomerBillingListOptions = {},
): Promise<CustomerInvoicesResponse> {
  const billing = await bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}?${buildBillingQuery(options, "invoices")}`,
  );

  return {
    invoices: billing.invoices ?? [],
    pagination: billing.invoices_pagination,
    totals: billing.totals,
    invoicesStats: billing.invoices_stats ?? null,
  };
}

export async function fetchCustomerPayments(
  customerUuid: string,
  options: FetchCustomerBillingListOptions = {},
): Promise<CustomerPaymentsResponse> {
  const billing = await bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}?${buildBillingQuery(options, "payments")}`,
  );

  return {
    payments: billing.payments ?? [],
    pagination: billing.payments_pagination,
    totals: billing.totals,
    invoicesStats: billing.invoices_stats ?? null,
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
