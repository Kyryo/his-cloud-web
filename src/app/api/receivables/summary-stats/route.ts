import { RECEIVABLES_API_PATHS } from "@/constants/receivables-api";
import type { ReceivablesSummaryStats } from "@/features/receivables/types/receivables.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<ReceivablesSummaryStats>(
      RECEIVABLES_API_PATHS.summaryStats,
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
