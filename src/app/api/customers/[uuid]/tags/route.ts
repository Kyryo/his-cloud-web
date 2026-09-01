import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { Tag } from "@/features/tags/types/tag.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

type SyncCustomerTagsPayload = {
  tag_uuids?: string[];
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as SyncCustomerTagsPayload;

    const tags = await hmisApiRequest<Tag[]>(CUSTOMERS_API_PATHS.tags(uuid), {
      method: "PUT",
      token: auth.accessToken,
      body: {
        tag_uuids: body.tag_uuids ?? [],
      },
    });

    return bffSuccess(tags);
  } catch (error) {
    return bffError(error);
  }
}
