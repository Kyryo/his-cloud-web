import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import type { LabReport } from "@/features/laboratory/types/laboratory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const report = await hmisApiRequest<LabReport>(
      LABORATORY_API_PATHS.report(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(report);
  } catch (error) {
    return bffError(error);
  }
}
