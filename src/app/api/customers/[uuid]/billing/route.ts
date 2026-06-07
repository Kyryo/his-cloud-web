import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import type { CustomerBillingSummary } from "@/features/customers/types/customer-billing.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

const FORWARDED_QUERY_KEYS = [
  "sales_limit",
  "sales_offset",
  "invoice_limit",
  "invoice_offset",
  "payment_limit",
  "payment_offset",
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const query = buildUpstreamQuery(request);
    const billing = await hmisApiRequest<CustomerBillingSummary>(
      `${CUSTOMERS_API_PATHS.billing(uuid)}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess(billing);
  } catch (error) {
    return bffError(error);
  }
}
