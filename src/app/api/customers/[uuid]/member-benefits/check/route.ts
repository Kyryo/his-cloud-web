import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { CustomerMemberBenefitsSnapshot } from "@/features/customers/types/customer-benefits.types";
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
    const snapshot = await hmisApiRequest<CustomerMemberBenefitsSnapshot>(
      CUSTOMERS_API_PATHS.memberBenefitsCheck(uuid),
      {
        method: "POST",
        token: auth.accessToken,
      },
    );

    return bffSuccess(snapshot, 202);
  } catch (error) {
    return bffError(error);
  }
}
