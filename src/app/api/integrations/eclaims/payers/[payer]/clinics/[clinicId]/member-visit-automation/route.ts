import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { MemberVisitAutomationRun } from "@/features/customers/types/member-visit-automation.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ payer: string; clinicId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { payer, clinicId } = await context.params;
    const body = await request.json();
    const run = await hmisApiRequest<MemberVisitAutomationRun>(
      CLAIMS_API_PATHS.clinicMemberVisitAutomation(payer, clinicId),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );
    return bffSuccess(run, 202);
  } catch (error) {
    return bffError(error);
  }
}
