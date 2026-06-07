import { NextResponse } from "next/server";

import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type {
  CreateCustomerInsurancePayload,
  CustomerInsurance,
} from "@/features/customers/types/customer-insurance.types";
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
    const insurance = await hmisApiRequest<CustomerInsurance[]>(
      `${CUSTOMERS_API_PATHS.insurance(uuid)}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess(insurance);
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
    const body = (await request.json()) as CreateCustomerInsurancePayload;

    if (!body.insurance_scheme || !body.membership_number?.trim()) {
      return NextResponse.json(
        { message: "Insurance scheme and membership number are required." },
        { status: 400 },
      );
    }

    const insurance = await hmisApiRequest<CustomerInsurance>(
      CUSTOMERS_API_PATHS.insurance(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(insurance, 201);
  } catch (error) {
    return bffError(error);
  }
}
