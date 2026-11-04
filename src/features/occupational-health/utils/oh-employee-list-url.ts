import { ROUTES } from "@/constants/routes";
import type { CustomerGender } from "@/features/customers/types/customer.types";
import {
  DEFAULT_CUSTOMER_ORDERING,
  type CustomerActiveFilter,
  type CustomerListFilterState,
  type CustomerOrdering,
} from "@/features/customers/utils/customer-list-filters";
import {
  CUSTOMER_GENDER_PARAM,
  CUSTOMER_ORDER_PARAM,
  CUSTOMER_PAGE_PARAM,
  CUSTOMER_SEARCH_PARAM,
  CUSTOMER_STATUS_PARAM,
  parseCustomerGender,
  parseCustomerOrdering,
  parseCustomerStatus,
  parseListPage,
} from "@/features/customers/utils/customer-list-url";

export {
  CUSTOMER_GENDER_PARAM as OH_EMPLOYEE_GENDER_PARAM,
  CUSTOMER_ORDER_PARAM as OH_EMPLOYEE_ORDER_PARAM,
  CUSTOMER_PAGE_PARAM as OH_EMPLOYEE_PAGE_PARAM,
  CUSTOMER_SEARCH_PARAM as OH_EMPLOYEE_SEARCH_PARAM,
  CUSTOMER_STATUS_PARAM as OH_EMPLOYEE_STATUS_PARAM,
  parseCustomerGender,
  parseCustomerOrdering,
  parseCustomerStatus,
  parseListPage,
};

type OhEmployeesHrefOptions = {
  search?: string;
  page?: number;
  gender?: CustomerGender | "all";
  activeStatus?: CustomerActiveFilter;
  ordering?: CustomerOrdering;
};

export function ohEmployeesHref({
  search = "",
  page = 1,
  gender = "all",
  activeStatus = "all",
  ordering = DEFAULT_CUSTOMER_ORDERING,
}: OhEmployeesHrefOptions = {}): string {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set(CUSTOMER_SEARCH_PARAM, trimmedSearch);
  }
  if (page > 1) {
    params.set(CUSTOMER_PAGE_PARAM, String(page));
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
  return query
    ? `${ROUTES.occupationalHealthEmployees}?${query}`
    : ROUTES.occupationalHealthEmployees;
}

export function filtersFromOhEmployeeSearchParams(
  searchParams: URLSearchParams,
): Pick<CustomerListFilterState, "gender" | "activeStatus" | "ordering" | "tags"> {
  return {
    gender: parseCustomerGender(searchParams.get(CUSTOMER_GENDER_PARAM)),
    activeStatus: parseCustomerStatus(searchParams.get(CUSTOMER_STATUS_PARAM)),
    ordering: parseCustomerOrdering(searchParams.get(CUSTOMER_ORDER_PARAM)),
    tags: [],
  };
}
