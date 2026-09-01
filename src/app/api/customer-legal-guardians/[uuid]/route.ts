import { CUSTOMER_LEGAL_GUARDIANS_API_PATHS } from "@/constants/customer-legal-guardians-api";
import type { CustomerLegalGuardian } from "@/features/customers/types/customer-legal-guardian.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
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

    const { uuid } = await context.params;
    const body = await request.json();

    const guardian = await hmisApiRequest<CustomerLegalGuardian>(
      CUSTOMER_LEGAL_GUARDIANS_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(guardian);
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

    const { uuid } = await context.params;

    await hmisApiRequest<void>(CUSTOMER_LEGAL_GUARDIANS_API_PATHS.detail(uuid), {
      method: "DELETE",
      token: auth.accessToken,
    });

    return bffSuccess(null, 204);
  } catch (error) {
    return bffError(error);
  }
}
