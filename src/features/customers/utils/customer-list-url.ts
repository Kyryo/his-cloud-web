import { ROUTES } from "@/constants/routes";
import type { CustomerGender } from "@/features/customers/types/customer.types";
import {
  DEFAULT_CUSTOMER_ORDERING,
  type CustomerActiveFilter,
  type CustomerListFilterState,
  type CustomerOrdering,
} from "@/features/customers/utils/customer-list-filters";

export const CUSTOMER_SEARCH_PARAM = "q";
export const CUSTOMER_PAGE_PARAM = "page";
export const CUSTOMER_NEW_PARAM = "new";
export const CUSTOMER_GENDER_PARAM = "gender";
export const CUSTOMER_STATUS_PARAM = "status";
export const CUSTOMER_ORDER_PARAM = "order";

export function parseListPage(value: string | null | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function parseCustomerGender(
  value: string | null | undefined,
): CustomerGender | "all" {
  if (value === "Male" || value === "Female" || value === "Other") {
    return value;
  }
  return "all";
}

export function parseCustomerStatus(
  value: string | null | undefined,
): CustomerActiveFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }
  return "all";
}

export function parseCustomerOrdering(
  value: string | null | undefined,
): CustomerOrdering {
  const allowed: CustomerOrdering[] = [
    "first_name",
    "-first_name",
    "last_name",
    "-last_name",
    "created_at",
    "-created_at",
    "updated_at",
    "-updated_at",
    "customer_identifier",
    "-customer_identifier",
  ];
  return allowed.includes(value as CustomerOrdering)
    ? (value as CustomerOrdering)
    : DEFAULT_CUSTOMER_ORDERING;
}

type CustomersHrefOptions = {
  search?: string;
  page?: number;
  newClient?: boolean;
  gender?: CustomerGender | "all";
  activeStatus?: CustomerActiveFilter;
  ordering?: CustomerOrdering;
};

export function customersHref({
  search = "",
  page = 1,
  newClient = false,
  gender = "all",
  activeStatus = "all",
  ordering = DEFAULT_CUSTOMER_ORDERING,
}: CustomersHrefOptions = {}): string {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set(CUSTOMER_SEARCH_PARAM, trimmedSearch);
  }
  if (page > 1) {
    params.set(CUSTOMER_PAGE_PARAM, String(page));
  }
  if (newClient) {
    params.set(CUSTOMER_NEW_PARAM, "1");
  }
  if (gender !== "all") {
    params.set(CUSTOMER_GENDER_PARAM, gender);
  }
  if (activeStatus !== "all") {
    params.set(CUSTOMER_STATUS_PARAM, activeStatus);
  }
  if (ordering !== DEFAULT_CUSTOMER_ORDERING) {
    params.set(CUSTOMER_ORDER_PARAM, ordering);
  }
  const query = params.toString();
  return query ? `${ROUTES.customers}?${query}` : ROUTES.customers;
}

export function filtersFromCustomerSearchParams(
  searchParams: URLSearchParams,
): Pick<CustomerListFilterState, "gender" | "activeStatus" | "ordering" | "tags"> {
  return {
    gender: parseCustomerGender(searchParams.get(CUSTOMER_GENDER_PARAM)),
    activeStatus: parseCustomerStatus(searchParams.get(CUSTOMER_STATUS_PARAM)),
    ordering: parseCustomerOrdering(searchParams.get(CUSTOMER_ORDER_PARAM)),
    tags: [],
  };
}
