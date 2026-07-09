import { PAYMENTS_API_PATHS } from "@/constants/payments-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { paymentId } = await context.params;
    const body = (await request.json()) as { email?: string };

    const result = await hmisApiRequest<{ queued: boolean }>(
      PAYMENTS_API_PATHS.sendReceipt(paymentId),
      {
        method: "POST",
        token: auth.accessToken,
        body: {
          email: body.email,
        },
      },
    );

    return bffSuccess(result, 202);
  } catch (error) {
    return bffError(error);
  }
}
