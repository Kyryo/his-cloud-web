import type { CustomerGender } from "@/features/customers/types/customer.types";

export type CustomerOrdering =
  | "first_name"
  | "-first_name"
  | "last_name"
  | "-last_name"
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at"
  | "customer_identifier"
  | "-customer_identifier";

export type CustomerSyncFilter = "all" | "synced" | "not_synced";

export type CustomerActiveFilter = "all" | "active" | "inactive";

export type CustomerListFilterState = {
  search: string;
  gender: CustomerGender | "all";
  syncStatus: CustomerSyncFilter;
  activeStatus: CustomerActiveFilter;
  ordering: CustomerOrdering;
};

export const DEFAULT_CUSTOMER_ORDERING: CustomerOrdering = "-created_at";

export const CUSTOMER_ORDERING_OPTIONS: Array<{
  value: CustomerOrdering;
  label: string;
}> = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "first_name", label: "First name (A–Z)" },
  { value: "-first_name", label: "First name (Z–A)" },
  { value: "last_name", label: "Last name (A–Z)" },
  { value: "-last_name", label: "Last name (Z–A)" },
  { value: "customer_identifier", label: "Client ID (A–Z)" },
  { value: "-customer_identifier", label: "Client ID (Z–A)" },
];

export function countActiveCustomerFilters(
  filters: Pick<
    CustomerListFilterState,
    "gender" | "syncStatus" | "activeStatus" | "ordering"
  >,
): number {
  let count = 0;

  if (filters.gender !== "all") count += 1;
  if (filters.syncStatus !== "all") count += 1;
  if (filters.activeStatus !== "all") count += 1;
  if (filters.ordering !== DEFAULT_CUSTOMER_ORDERING) count += 1;

  return count;
}

export function buildCustomerListFilters(
  state: CustomerListFilterState & { page: number; pageSize: number },
) {
  return {
    search: state.search.trim() || undefined,
    page: state.page,
    pageSize: state.pageSize,
    gender: state.gender === "all" ? undefined : state.gender,
    hasSyncedToOdoo:
      state.syncStatus === "all"
        ? undefined
        : state.syncStatus === "synced",
    isActive:
      state.activeStatus === "all"
        ? undefined
        : state.activeStatus === "active",
    ordering: state.ordering,
  };
}
