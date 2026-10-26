import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { PayerMember } from "@/features/customers/types/payer-member.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ payer: string; clinicId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { payer, clinicId } = await context.params;
    const membershipNumber = new URL(request.url).searchParams.get(
      "membership_number",
    );
    const query = new URLSearchParams();
    if (membershipNumber?.trim()) {
      query.set("membership_number", membershipNumber.trim());
    }
    const suffix = query.toString() ? `?${query}` : "";
    const member = await hmisApiRequest<PayerMember>(
      `${CLAIMS_API_PATHS.clinicMemberSearch(payer, clinicId)}${suffix}`,
      { token: auth.accessToken, timeoutMs: 210_000 },
    );

    return bffSuccess(member);
  } catch (error) {
    return bffError(error);
  }
}
