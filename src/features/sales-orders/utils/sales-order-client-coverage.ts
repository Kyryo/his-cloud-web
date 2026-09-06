import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";

export type ClientCoverageSource = {
  insurance_scheme_id?: number | null;
  insurance_scheme_name?: string | null;
  insurance_company?: string | null;
};

export function formatInsuranceMembership(record: CustomerInsurance): string {
  const number = record.membership_number.trim();
  const suffix = record.suffix?.trim() ?? "";
  return suffix ? `${number}-${suffix}` : number;
}

export function formatInsuranceMemberType(record: CustomerInsurance): string {
  if (record.is_principal_member) {
    return "Principal member";
  }

  return record.relationship_to_principal_member.trim() || "Dependent";
}

export function isOrderCoverage(
  record: CustomerInsurance,
  order: ClientCoverageSource,
): boolean {
  if (
    order.insurance_scheme_id != null &&
    record.insurance_scheme === order.insurance_scheme_id
  ) {
    return true;
  }

  const scheme = order.insurance_scheme_name?.trim().toLowerCase() ?? "";
  const company = order.insurance_company?.trim().toLowerCase() ?? "";
  const recordScheme = record.scheme_name.trim().toLowerCase();
  const recordCompany = record.insurance_company_name.trim().toLowerCase();

  if (scheme && company) {
    return recordScheme === scheme && recordCompany === company;
  }

  return Boolean(scheme && recordScheme === scheme);
}

export function sortClientCoverage(
  records: CustomerInsurance[],
  order: ClientCoverageSource,
): CustomerInsurance[] {
  return records.toSorted((left, right) => {
    const leftOnOrder = isOrderCoverage(left, order) ? 0 : 1;
    const rightOnOrder = isOrderCoverage(right, order) ? 0 : 1;
    if (leftOnOrder !== rightOnOrder) {
      return leftOnOrder - rightOnOrder;
    }

    const leftPrimary = left.is_primary ? 0 : 1;
    const rightPrimary = right.is_primary ? 0 : 1;
    if (leftPrimary !== rightPrimary) {
      return leftPrimary - rightPrimary;
    }

    const leftActive = left.is_active ? 0 : 1;
    const rightActive = right.is_active ? 0 : 1;
    return leftActive - rightActive;
  });
}
