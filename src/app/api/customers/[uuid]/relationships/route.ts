import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type {
  CreateCustomerRelationshipPayload,
  CustomerRelationship,
  CustomerRelationshipListResponse,
} from "@/features/customers/types/customer-relationship.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const status = new URL(request.url).searchParams.get("status");
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const data = await hmisApiRequest<CustomerRelationshipListResponse>(
      `${CUSTOMERS_API_PATHS.relationships(uuid)}${query}`,
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
    const body = (await request.json()) as CreateCustomerRelationshipPayload;
    const data = await hmisApiRequest<CustomerRelationship>(
      CUSTOMERS_API_PATHS.relationships(uuid),
      {
        token: auth.accessToken,
        method: "POST",
        body,
      },
    );

    return bffSuccess(data, 201);
  } catch (error) {
    return bffError(error);
  }
}
