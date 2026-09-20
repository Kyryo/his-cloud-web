import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(
  _request: Request,
  context: { params: Promise<{ uuid: string }> },
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const data = await hmisApiRequest<unknown>(
      LABORATORY_API_PATHS.testActivity(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
