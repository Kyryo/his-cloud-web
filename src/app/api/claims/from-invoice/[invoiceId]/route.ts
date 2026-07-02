import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ invoiceId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { invoiceId } = await context.params;
    const body = await request.json().catch(() => ({}));

    const claim = await hmisApiRequest<ClaimDetail>(
      CLAIMS_API_PATHS.fromInvoice(invoiceId),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(claim, 201);
  } catch (error) {
    return bffError(error);
  }
}
