import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { batchId } = await context.params;
    const data = await hmisApiRequest(CLAIMS_API_PATHS.remittanceRematch(batchId), {
      token: auth.accessToken,
      method: "POST",
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
