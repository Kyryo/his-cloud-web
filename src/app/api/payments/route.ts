import { PAYMENTS_API_PATHS } from "@/constants/payments-api";
import type { Payment } from "@/features/payments/types/payment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "name",
  "state",
  "payment_method",
  "date_from",
  "date_to",
  "customer_id",
  "invoice_id",
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
    const { data, meta } = await hmisApiRequestWithMeta<Payment[]>(
      `${PAYMENTS_API_PATHS.list}${query}`,
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

    const body = await request.json();
    const payment = await hmisApiRequest<Payment>(PAYMENTS_API_PATHS.list, {
      method: "POST",
      token: auth.accessToken,
      body,
    });

    return bffSuccess(payment, 201);
  } catch (error) {
    return bffError(error);
  }
}
