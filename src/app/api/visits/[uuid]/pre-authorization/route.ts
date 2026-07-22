import { VISITS_API_PATHS } from "@/constants/visits-api";
import { editVisitPreAuthorizationSchema } from "@/features/visits/schemas/edit-visit-pre-authorization.schema";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const parsed = await parseJsonBody(request, editVisitPreAuthorizationSchema);
    if ("error" in parsed) {
      return parsed.error;
    }

    const { uuid } = await context.params;
    const visit = await hmisApiRequest<VisitDetail>(
      VISITS_API_PATHS.preAuthorization(uuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body: {
          requires_pre_authorization: parsed.data.requires_pre_authorization,
          pre_authorization_number: parsed.data.pre_authorization_number,
          pre_authorization_comments: parsed.data.pre_authorization_comments,
        },
      },
    );

    return bffSuccess(visit);
  } catch (error) {
    return bffError(error);
  }
}
