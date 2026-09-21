import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { VisitEncounterAttachment } from "@/features/visits/types/visit-attachment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string; attachmentUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, attachmentUuid } = await context.params;
    const data = await hmisApiRequest<VisitEncounterAttachment>(
      VISITS_API_PATHS.encounterAttachment(uuid, attachmentUuid),
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, attachmentUuid } = await context.params;
    await hmisApiRequest(
      VISITS_API_PATHS.encounterAttachment(uuid, attachmentUuid),
      {
        token: auth.accessToken,
        method: "DELETE",
      },
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    return bffError(error);
  }
}
