import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type {
  CreateCustomerInsurancePayload,
  CustomerInsurance,
  UpdateCustomerInsurancePayload,
} from "@/features/customers/types/customer-insurance.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchCustomerInsurance(
  customerUuid: string,
): Promise<CustomerInsurance[]> {
  return bffRequest<CustomerInsurance[]>(
    BFF_CUSTOMERS_ROUTES.insurance(customerUuid),
  );
}

export async function createCustomerInsurance(
  customerUuid: string,
  payload: CreateCustomerInsurancePayload,
): Promise<CustomerInsurance> {
  return bffRequest<CustomerInsurance>(
    BFF_CUSTOMERS_ROUTES.insurance(customerUuid),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateCustomerInsurance(
  customerUuid: string,
  insuranceUuid: string,
  payload: UpdateCustomerInsurancePayload,
): Promise<CustomerInsurance> {
  return bffRequest<CustomerInsurance>(
    BFF_CUSTOMERS_ROUTES.insuranceDetail(customerUuid, insuranceUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}
