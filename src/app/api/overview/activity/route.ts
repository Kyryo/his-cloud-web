import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<unknown[]>("/overview/activity/", {
      token: auth.accessToken,
    });

    return bffSuccess(Array.isArray(data) ? data : []);
  } catch (error) {
    return bffError(error);
  }
}
