import { SALES_ORDERS_API_PATHS } from "@/constants/sales-orders-api";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ orderId: string; lineId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { orderId, lineId } = await context.params;

  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const order = await hmisApiRequest<SalesOrder>(
      SALES_ORDERS_API_PATHS.lineReprice(orderId, lineId),
      {
        method: "POST",
        token: auth.accessToken,
      },
    );

    return bffSuccess(order);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[sales-orders/lines/reprice] HMIS API error", {
        orderId,
        lineId,
        status: error.status,
        message: error.message,
        errors: error.errors,
      });
    } else {
      console.error("[sales-orders/lines/reprice] Unexpected error", {
        orderId,
        lineId,
        error,
      });
    }
    return bffError(error);
  }
}
