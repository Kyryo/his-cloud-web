import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ clinicId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { clinicId } = await context.params;
    const status = await hmisApiRequest<{ is_enabled: boolean }>(
      CLAIMS_API_PATHS.clinicPayerIntegrationStatus("masm", clinicId),
      { token: auth.accessToken },
    );
    return bffSuccess(status);
  } catch (error) {
    return bffError(error);
  }
}
