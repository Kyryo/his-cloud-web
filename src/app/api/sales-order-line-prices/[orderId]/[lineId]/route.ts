import { SALES_ORDERS_API_PATHS } from "@/constants/sales-orders-api";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ orderId: string; lineId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { orderId, lineId } = await context.params;
    const body = await request.json();

    const order = await hmisApiRequest<SalesOrder>(
      SALES_ORDERS_API_PATHS.linePrice(orderId, lineId),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(order);
  } catch (error) {
    return bffError(error);
  }
}
