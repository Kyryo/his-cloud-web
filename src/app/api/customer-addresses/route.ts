import { NextResponse } from "next/server";

import { CUSTOMER_ADDRESSES_API_PATHS } from "@/constants/customer-addresses-api";
import type {
  CreateCustomerAddressPayload,
  CustomerAddress,
} from "@/features/customers/types/customer-address.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = [
  "customer",
  "page",
  "page_size",
  "address_type",
  "is_primary",
  "is_active",
  "ordering",
] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildUpstreamQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<CustomerAddress[]>(
      `${CUSTOMER_ADDRESSES_API_PATHS.list}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as CreateCustomerAddressPayload;

    if (!body.customer || !body.line1?.trim()) {
      return NextResponse.json(
        { message: "Customer and address line 1 are required." },
        { status: 400 },
      );
    }

    const address = await hmisApiRequest<CustomerAddress>(
      CUSTOMER_ADDRESSES_API_PATHS.list,
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(address, 201);
  } catch (error) {
    return bffError(error);
  }
}
