import { AUTH_API_PATHS } from "@/constants/auth-api";
import { mfaPasswordSchema } from "@/features/settings/schemas/mfa.schema";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const parsed = await parseJsonBody(request, mfaPasswordSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{ detail: string }>(
      AUTH_API_PATHS.mfaTotpDeactivate,
      {
        method: "POST",
        token: auth.accessToken,
        body: parsed.data,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
