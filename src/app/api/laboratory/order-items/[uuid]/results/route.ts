import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import type {
  LabResult,
  UpsertLabResultPayload,
} from "@/features/laboratory/types/laboratory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const result = await hmisApiRequest<LabResult>(
      LABORATORY_API_PATHS.orderItemResults(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as UpsertLabResultPayload;
    const result = await hmisApiRequest<LabResult>(
      LABORATORY_API_PATHS.orderItemResults(uuid),
      {
        method: "PUT",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}
