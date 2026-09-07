import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CustomerMemberBenefitsSnapshot,
  CustomerMemberBenefitsStatus,
} from "@/features/customers/types/customer-benefits.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchCustomerMemberBenefits(
  customerUuid: string,
): Promise<CustomerMemberBenefitsStatus> {
  return bffRequest<CustomerMemberBenefitsStatus>(
    BFF_CUSTOMERS_ROUTES.memberBenefits(customerUuid),
  );
}

export async function checkCustomerMemberBenefits(
  customerUuid: string,
): Promise<CustomerMemberBenefitsSnapshot> {
  return bffRequest<CustomerMemberBenefitsSnapshot>(
    BFF_CUSTOMERS_ROUTES.memberBenefitsCheck(customerUuid),
    { method: "POST" },
  );
}
