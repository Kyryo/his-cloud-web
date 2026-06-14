import { SALES_ORDERS_API_PATHS } from "@/constants/sales-orders-api";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { orderId } = await context.params;
    const body = await request.json();

    const order = await hmisApiRequest<SalesOrder>(
      SALES_ORDERS_API_PATHS.lines(orderId),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(order, 201);
  } catch (error) {
    return bffError(error);
  }
}
