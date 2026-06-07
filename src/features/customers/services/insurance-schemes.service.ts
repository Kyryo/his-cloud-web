import { BFF_INSURANCE_ROUTES } from "@/constants/api";
import type {
  InsuranceScheme,
  InsuranceSchemesListResponse,
} from "@/features/customers/types/customer-insurance.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchInsuranceSchemes(): Promise<InsuranceScheme[]> {
  const response = await bffRequest<InsuranceSchemesListResponse>(
    BFF_INSURANCE_ROUTES.schemes,
  );

  return response.results.filter((scheme) => scheme.is_active);
}
