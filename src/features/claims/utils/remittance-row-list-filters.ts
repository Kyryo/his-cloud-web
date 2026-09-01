import type { RemittanceRowResolutionStatus } from "@/features/claims/types/remittances.types";

export type RemittanceRowStatusFilter = "all" | RemittanceRowResolutionStatus;

export type RemittanceRowListFilterState = {
  resolutionStatus: RemittanceRowStatusFilter;
};

export const DEFAULT_REMITTANCE_ROW_LIST_FILTERS: RemittanceRowListFilterState = {
  resolutionStatus: "all",
};

export const REMITTANCE_ROW_STATUS_FILTER_OPTIONS: Array<{
  value: RemittanceRowStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "pending_match", label: "Pending match" },
  { value: "unmatched", label: "Unmatched" },
  { value: "pending_review", label: "Pending review" },
  { value: "auto_applied", label: "Auto applied" },
  { value: "manually_resolved", label: "Manually resolved" },
  { value: "rejected", label: "Rejected" },
];

export function countActiveRemittanceRowFilters(
  filters: RemittanceRowListFilterState,
): number {
  return filters.resolutionStatus !== "all" ? 1 : 0;
}
