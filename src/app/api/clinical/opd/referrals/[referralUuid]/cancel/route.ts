import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ referralUuid: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { referralUuid } = await context.params;
  return handleClinicalAction(
    CLINICAL_OPD_API_PATHS.cancelReferral(referralUuid),
  );
}
