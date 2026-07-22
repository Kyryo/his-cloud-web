import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { Customer } from "@/features/customers/types/customer.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

type OpeningBalancePayload = {
  opening_balance: string | number;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as OpeningBalancePayload;

    const customer = await hmisApiRequest<Customer>(
      CUSTOMERS_API_PATHS.openingBalance(uuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(customer);
  } catch (error) {
    return bffError(error);
  }
}
