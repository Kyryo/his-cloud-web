import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { hmisApiRequest } from "@/lib/server/hmis-api";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { reason?: string };

    const appointment = await hmisApiRequest(
      APPOINTMENTS_API_PATHS.cancel(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body: { reason: body.reason ?? "" },
      },
    );

    return bffSuccess(appointment);
  } catch (error) {
    return bffError(error);
  }
}
