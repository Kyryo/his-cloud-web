import { PAYMENTS_API_PATHS } from "@/constants/payments-api";
import type { Payment } from "@/features/payments/types/payment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { paymentId } = await context.params;
    const payment = await hmisApiRequest<Payment>(
      PAYMENTS_API_PATHS.detail(paymentId),
      { token: auth.accessToken },
    );

    return bffSuccess(payment);
  } catch (error) {
    return bffError(error);
  }
}
