import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
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
    const visits = await hmisApiRequest<CustomerVisit[]>(
      CUSTOMERS_API_PATHS.visits(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(visits);
  } catch (error) {
    return bffError(error);
  }
}
