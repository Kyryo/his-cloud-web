import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { visitUuid, encounterUuid } = await context.params;
    const results = await hmisApiRequest<unknown[]>(
      CLINICAL_OPD_API_PATHS.encounterReferralReceivingClinics(
        visitUuid,
        encounterUuid,
      ),
      { token: auth.accessToken },
    );
    return bffSuccess({ results });
  } catch (error) {
    return bffError(error);
  }
}
