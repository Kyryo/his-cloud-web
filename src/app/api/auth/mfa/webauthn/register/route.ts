import { z } from "zod";

import { AUTH_API_PATHS } from "@/constants/auth-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

const registerSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  name: z.string().trim().max(100).optional(),
  credential: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const parsed = await parseJsonBody(request, registerSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{
      id: number;
      name: string;
      recovery_codes: string[];
    }>(AUTH_API_PATHS.mfaWebAuthnRegister, {
      method: "POST",
      token: auth.accessToken,
      body: parsed.data,
    });
    return bffSuccess(data, 201);
  } catch (error) {
    return bffError(error);
  }
}
