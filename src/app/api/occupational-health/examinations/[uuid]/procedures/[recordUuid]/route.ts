import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ uuid: string; recordUuid: string }> },
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { uuid, recordUuid } = await context.params;
    const body = await request.json();
    const data = await hmisApiRequest<unknown>(
      OCCUPATIONAL_HEALTH_API_PATHS.ohExaminationProcedure(uuid, recordUuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
