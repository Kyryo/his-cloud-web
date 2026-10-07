import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { MemberVisitAutomationRun } from "@/features/customers/types/member-visit-automation.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const runs = await hmisApiRequest<{ results: MemberVisitAutomationRun[] }>(
      CLAIMS_API_PATHS.memberVisitAutomation,
      { token: auth.accessToken },
    );
    return bffSuccess(runs);
  } catch (error) {
    return bffError(error);
  }
}
