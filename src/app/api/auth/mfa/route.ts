import { AUTH_API_PATHS } from "@/constants/auth-api";
import type { MfaStatus } from "@/features/settings/types/mfa.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<MfaStatus>(AUTH_API_PATHS.mfa, {
      token: auth.accessToken,
    });
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
