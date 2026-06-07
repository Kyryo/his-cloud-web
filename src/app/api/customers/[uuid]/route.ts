import { NextResponse } from "next/server";

import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type {
  Customer,
  UpdateCustomerPayload,
} from "@/features/customers/types/customer.types";
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
    const customer = await hmisApiRequest<Customer>(
      CUSTOMERS_API_PATHS.detail(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(customer);
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

    const { uuid } = await context.params;
    const body = (await request.json()) as UpdateCustomerPayload;

    if (!body.first_name?.trim() || !body.last_name?.trim() || !body.gender) {
      return NextResponse.json(
        { message: "First name, last name, and gender are required." },
        { status: 400 },
      );
    }

    const customer = await hmisApiRequest<Customer>(
      CUSTOMERS_API_PATHS.detail(uuid),
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
