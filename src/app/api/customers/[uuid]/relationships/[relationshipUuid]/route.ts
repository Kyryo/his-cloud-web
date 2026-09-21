import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type {
  CustomerRelationship,
  UpdateCustomerRelationshipPayload,
} from "@/features/customers/types/customer-relationship.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string; relationshipUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, relationshipUuid } = await context.params;
    const data = await hmisApiRequest<CustomerRelationship>(
      CUSTOMERS_API_PATHS.relationshipDetail(uuid, relationshipUuid),
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, relationshipUuid } = await context.params;
    const body = (await request.json()) as UpdateCustomerRelationshipPayload;
    const data = await hmisApiRequest<CustomerRelationship>(
      CUSTOMERS_API_PATHS.relationshipDetail(uuid, relationshipUuid),
      {
        token: auth.accessToken,
        method: "PATCH",
        body,
      },
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

    const { uuid, relationshipUuid } = await context.params;
    await hmisApiRequest(
      CUSTOMERS_API_PATHS.relationshipDetail(uuid, relationshipUuid),
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
