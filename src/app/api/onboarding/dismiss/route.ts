import { ONBOARDING_API_PATHS } from "@/constants/onboarding-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as { dismissed?: unknown };
    const data = await hmisApiRequest(ONBOARDING_API_PATHS.dismiss, {
      method: "POST",
      token: auth.accessToken,
      body: { dismissed: body.dismissed === true },
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
