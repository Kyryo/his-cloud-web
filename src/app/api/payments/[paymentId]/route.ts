import { z } from "zod";

import { PAYMENTS_API_PATHS } from "@/constants/payments-api";
import type { Payment } from "@/features/payments/types/payment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

const updatePaymentBodySchema = z.object({
  amount: z.union([z.string(), z.number()]),
  payment_method: z.string().optional(),
  payment_date: z.string().optional(),
  note: z.string().optional(),
});

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const parsed = await parseJsonBody(request, updatePaymentBodySchema);
    if ("error" in parsed) {
      return parsed.error;
    }

    const { paymentId } = await context.params;
    const payment = await hmisApiRequest<Payment>(
      PAYMENTS_API_PATHS.detail(paymentId),
      {
        method: "PATCH",
        token: auth.accessToken,
        body: parsed.data,
      },
    );

    return bffSuccess(payment);
  } catch (error) {
    return bffError(error);
  }
}
