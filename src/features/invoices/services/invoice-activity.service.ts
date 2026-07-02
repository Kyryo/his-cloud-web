import { BFF_INVOICE_ACTIVITY_ROUTES } from "@/constants/api";
import type { BillingActivityListResponse } from "@/features/billing/types/billing-activity.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchInvoiceActivity(
  invoiceId: number | string,
): Promise<BillingActivityListResponse> {
  return bffRequest<BillingActivityListResponse>(
    BFF_INVOICE_ACTIVITY_ROUTES.detail(invoiceId),
  );
}
