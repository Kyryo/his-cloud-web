import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CustomerBillingCounts,
  CustomerBillingSummary,
} from "@/features/customers/types/customer-billing.types";
import { bffRequest } from "@/lib/bff-client";

const SUMMARY_BILLING_QUERY =
  "?sales_limit=1&sales_offset=0&invoice_limit=1&invoice_offset=0&payment_limit=1&payment_offset=0";

export async function fetchCustomerBillingSummary(
  customerUuid: string,
): Promise<CustomerBillingSummary> {
  return bffRequest<CustomerBillingSummary>(
    `${BFF_CUSTOMERS_ROUTES.billing(customerUuid)}${SUMMARY_BILLING_QUERY}`,
  );
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
