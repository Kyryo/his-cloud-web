import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import type { LabResult } from "@/features/laboratory/types/laboratory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

type ReleaseBody = {
  allow_unverified?: boolean;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    let body: ReleaseBody = {};
    try {
      body = (await request.json()) as ReleaseBody;
    } catch {
      body = {};
    }

    const result = await hmisApiRequest<LabResult>(
      LABORATORY_API_PATHS.release(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body: {
          allow_unverified: Boolean(body.allow_unverified),
        },
      },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}
