import { VISITS_API_PATHS } from "@/constants/visits-api";
import type {
  VisitEncounterAttachment,
  VisitEncounterAttachmentListResponse,
} from "@/features/visits/types/visit-attachment.types";
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
    const data = await hmisApiRequest<VisitEncounterAttachmentListResponse>(
      VISITS_API_PATHS.encounterAttachments(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const formData = await request.formData();
    const data = await hmisApiRequest<VisitEncounterAttachment>(
      VISITS_API_PATHS.encounterAttachments(uuid),
      {
        token: auth.accessToken,
        method: "POST",
        body: formData,
      },
    );

    return bffSuccess(data, 201);
  } catch (error) {
    return bffError(error);
  }
}
