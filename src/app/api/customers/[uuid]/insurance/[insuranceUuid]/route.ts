import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string; insuranceUuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, insuranceUuid } = await context.params;
    const body = await request.json();

    const insurance = await hmisApiRequest<CustomerInsurance>(
      CUSTOMERS_API_PATHS.insuranceDetail(uuid, insuranceUuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(insurance);
  } catch (error) {
    return bffError(error);
  }
}
