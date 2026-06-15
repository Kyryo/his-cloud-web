import { SALES_ORDERS_API_PATHS } from "@/constants/sales-orders-api";
import type { CreateSalesOrderInvoiceResponse } from "@/features/sales-orders/types/sales-order.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { orderId } = await context.params;
    const result = await hmisApiRequest<CreateSalesOrderInvoiceResponse>(
      SALES_ORDERS_API_PATHS.invoice(orderId),
      {
        method: "POST",
        token: auth.accessToken,
      },
    );

    return bffSuccess(result, 201);
  } catch (error) {
    return bffError(error);
  }
}
