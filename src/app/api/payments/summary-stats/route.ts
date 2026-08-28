import { PAYMENTS_API_PATHS } from "@/constants/payments-api";
import type { PaymentSummaryStats } from "@/features/payments/types/payment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = [
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
    const data = await hmisApiRequest<PaymentSummaryStats>(
      `${PAYMENTS_API_PATHS.summaryStats}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}
