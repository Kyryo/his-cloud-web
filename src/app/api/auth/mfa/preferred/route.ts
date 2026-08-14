import { z } from "zod";

import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

const preferredSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  method: z.enum(["email", "totp", "webauthn"]),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const parsed = await parseJsonBody(request, preferredSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{ preferred_method: string }>(
      AUTH_API_PATHS.mfaPreferred,
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
