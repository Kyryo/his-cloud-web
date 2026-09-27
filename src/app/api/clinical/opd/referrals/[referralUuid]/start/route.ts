import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ referralUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { referralUuid } = await context.params;
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  return handleClinicalAction(
    CLINICAL_OPD_API_PATHS.startReferral(referralUuid),
    "user",
    body,
  );
}
