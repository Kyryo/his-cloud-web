import type { ClaimStatus } from "@/features/claims/types/claims.types";

export const CLAIM_STATUS_OPTIONS: Array<{
  value: ClaimStatus;
  label: string;
}> = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];
