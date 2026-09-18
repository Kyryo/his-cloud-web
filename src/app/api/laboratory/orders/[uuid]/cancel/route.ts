import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const order = await hmisApiRequest<LabOrder>(
      LABORATORY_API_PATHS.cancel(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body: {},
      },
    );

    return bffSuccess(order);
  } catch (error) {
    return bffError(error);
  }
}
