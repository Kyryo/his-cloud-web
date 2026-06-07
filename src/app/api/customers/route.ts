import { NextResponse } from "next/server";

import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { CreateCustomerPayload } from "@/features/customers/types/customer.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "gender",
  "has_synced_to_odoo",
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
    const { data, meta } = await hmisApiRequestWithMeta<Customer[]>(
      `${CUSTOMERS_API_PATHS.list}${query}`,
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

    const body = (await request.json()) as CreateCustomerPayload;

    if (!body.first_name?.trim() || !body.last_name?.trim() || !body.gender) {
      return NextResponse.json(
        { message: "First name, last name, and gender are required." },
        { status: 400 },
      );
    }

    const customer = await hmisApiRequest<Customer>(CUSTOMERS_API_PATHS.list, {
      method: "POST",
      token: auth.accessToken,
      body,
    });

    return bffSuccess(customer, 201);
  } catch (error) {
    return bffError(error);
  }
}
