import { z } from "zod";

import { AUTH_API_PATHS } from "@/constants/auth-api";
import { mfaPasswordSchema } from "@/features/settings/schemas/mfa.schema";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

const renameSchema = z.object({
  password: z.string().min(1, "Current password is required"),
  name: z.string().trim().min(1, "Name is required").max(100),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { id } = await context.params;
    const authenticatorId = Number.parseInt(id, 10);
    if (Number.isNaN(authenticatorId)) {
      return bffSuccess({ message: "Invalid security key." }, 400);
    }
    const parsed = await parseJsonBody(request, renameSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{ id: number; name: string }>(
      AUTH_API_PATHS.mfaWebAuthnDetail(authenticatorId),
      {
        method: "PATCH",
        token: auth.accessToken,
        body: parsed.data,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { id } = await context.params;
    const authenticatorId = Number.parseInt(id, 10);
    if (Number.isNaN(authenticatorId)) {
      return bffSuccess({ message: "Invalid security key." }, 400);
    }
    const parsed = await parseJsonBody(request, mfaPasswordSchema);
    if ("error" in parsed) {
      return parsed.error;
    }
    const data = await hmisApiRequest<{ detail: string }>(
      AUTH_API_PATHS.mfaWebAuthnDetail(authenticatorId),
      {
        method: "DELETE",
        token: auth.accessToken,
        body: parsed.data,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
