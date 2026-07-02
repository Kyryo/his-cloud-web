import { BFF_SALES_ORDER_ACTIVITY_ROUTES } from "@/constants/api";
import type { BillingActivityListResponse } from "@/features/billing/types/billing-activity.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchSalesOrderActivity(
  orderId: number | string,
): Promise<BillingActivityListResponse> {
  return bffRequest<BillingActivityListResponse>(
    BFF_SALES_ORDER_ACTIVITY_ROUTES.detail(orderId),
  );
}
