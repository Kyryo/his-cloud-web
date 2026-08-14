import { z } from "zod";

import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

const activateSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit authenticator code"),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const parsed = await parseJsonBody(request, activateSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{ recovery_codes: string[] }>(
      AUTH_API_PATHS.mfaTotpActivate,
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
