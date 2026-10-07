import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import type { PayerMember } from "@/features/customers/types/payer-member.types";
import { bffRequest } from "@/lib/bff-client";

const MEMBER_SEARCH_TIMEOUT_MS = 90_000;

export async function searchPayerMember(options: {
  payer: string;
  clinicId: number;
  membershipNumber: string;
}): Promise<PayerMember> {
  const params = new URLSearchParams({
    membership_number: options.membershipNumber.trim(),
  });
  return bffRequest<PayerMember>(
    `${BFF_CLAIMS_ROUTES.clinicMemberSearch(options.payer, options.clinicId)}?${params}`,
    { timeoutMs: MEMBER_SEARCH_TIMEOUT_MS },
  );
}
