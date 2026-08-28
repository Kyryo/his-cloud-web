import { NOTIFICATIONS_API_PATHS } from "@/constants/notifications-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function POST() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<{ updated: number }>(
      NOTIFICATIONS_API_PATHS.readAll,
      { method: "POST", token: auth.accessToken },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
