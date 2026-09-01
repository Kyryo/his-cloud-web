import { NextResponse } from "next/server";

import { CUSTOMER_LEGAL_GUARDIANS_API_PATHS } from "@/constants/customer-legal-guardians-api";
import type {
  CreateCustomerLegalGuardianPayload,
  CustomerLegalGuardian,
} from "@/features/customers/types/customer-legal-guardian.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = [
  "customer",
  "page",
  "page_size",
  "relationship",
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
    const { data, meta } = await hmisApiRequestWithMeta<CustomerLegalGuardian[]>(
      `${CUSTOMER_LEGAL_GUARDIANS_API_PATHS.list}${query}`,
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

    const body = (await request.json()) as CreateCustomerLegalGuardianPayload;

    if (!body.customer || !body.full_name?.trim()) {
      return NextResponse.json(
        { message: "Customer and full name are required." },
        { status: 400 },
      );
    }

    const guardian = await hmisApiRequest<CustomerLegalGuardian>(
      CUSTOMER_LEGAL_GUARDIANS_API_PATHS.list,
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(guardian, 201);
  } catch (error) {
    return bffError(error);
  }
}
