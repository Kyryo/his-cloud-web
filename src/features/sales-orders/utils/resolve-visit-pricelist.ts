import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import {
  fetchOrganizationDefaultPricelist,
  fetchOrganizationPricelists,
} from "@/features/settings/services/settings.service";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";

export async function resolveVisitPricelist(
  visit: VisitDetail,
): Promise<OrganizationPricelist | null> {
  const [pricelistResponse, defaultPricelist, customerInsurance] = await Promise.all([
    fetchOrganizationPricelists(),
    fetchOrganizationDefaultPricelist(),
    visit.mode_of_payment === "insurance" && visit.insurance_scheme
      ? fetchCustomerInsurance(visit.customer)
      : Promise.resolve([] as CustomerInsurance[]),
  ]);

  let pricelistUuid = defaultPricelist.default_pricelist_uuid;

  if (visit.mode_of_payment === "insurance" && visit.insurance_scheme) {
    const insurance = customerInsurance.find(
      (record) => record.uuid === visit.insurance_scheme,
    );
    if (insurance?.pricelist_id) {
      // Insurance schemes still expose legacy numeric pricelist_id; skip until migrated.
    }
  }

  if (!pricelistUuid) {
    return null;
  }

  return (
    pricelistResponse.results.find((pricelist) => pricelist.uuid === pricelistUuid) ??
    null
  );
}

export function formatVisitPickerLabel(visit: VisitDetail): string {
  const parts = [
    visit.visit_date,
    visit.status,
    visit.clinic_name,
    visit.mode_of_payment === "insurance" ? "Insurance" : "Cash",
  ].filter(Boolean);

  return parts.join(" · ");
}
