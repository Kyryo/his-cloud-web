import { CUSTOMER_ADDRESSES_API_PATHS } from "@/constants/customer-addresses-api";
import type { CustomerAddress } from "@/features/customers/types/customer-address.types";
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

    const address = await hmisApiRequest<CustomerAddress>(
      CUSTOMER_ADDRESSES_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(address);
  } catch (error) {
    return bffError(error);
  }
}
