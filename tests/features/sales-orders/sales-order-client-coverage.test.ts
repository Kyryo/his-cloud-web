import { describe, expect, it } from "vitest";

import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import {
  formatInsuranceMemberType,
  formatInsuranceMembership,
  isOrderCoverage,
  sortClientCoverage,
} from "@/features/sales-orders/utils/sales-order-client-coverage";

const record = {
  insurance_scheme: 44,
  scheme_name: "VIP",
  insurance_company_name: "MASM",
  membership_number: "MEM123",
  suffix: "001",
  is_principal_member: true,
  relationship_to_principal_member: "Self",
  is_primary: false,
  is_active: true,
} as CustomerInsurance;

describe("sales-order-client-coverage", () => {
  it("formats membership and member type", () => {
    expect(formatInsuranceMembership(record)).toBe("MEM123-001");
    expect(formatInsuranceMemberType(record)).toBe("Principal member");
    expect(
      formatInsuranceMemberType({
        ...record,
        is_principal_member: false,
        relationship_to_principal_member: "Spouse",
      }),
    ).toBe("Spouse");
  });

  it("matches the scheme used on the order", () => {
    expect(
      isOrderCoverage(record, {
        insurance_scheme_id: 44,
        insurance_scheme_name: "VIP",
        insurance_company: "MASM",
      }),
    ).toBe(true);
    expect(
      isOrderCoverage(record, {
        insurance_scheme_id: 9,
        insurance_scheme_name: "VIP",
        insurance_company: "MASM",
      }),
    ).toBe(true);
    expect(
      isOrderCoverage(record, {
        insurance_scheme_id: 9,
        insurance_scheme_name: "Basic",
        insurance_company: "MASM",
      }),
    ).toBe(false);
  });

  it("sorts the order scheme first", () => {
    const other = {
      ...record,
      uuid: "other",
      insurance_scheme: 8,
      scheme_name: "Basic",
      is_primary: true,
    };
    const ordered = sortClientCoverage([other, { ...record, uuid: "match" }], {
      insurance_scheme_id: 44,
      insurance_scheme_name: "VIP",
      insurance_company: "MASM",
    });

    expect(ordered.map((item) => item.uuid)).toEqual(["match", "other"]);
  });
});
