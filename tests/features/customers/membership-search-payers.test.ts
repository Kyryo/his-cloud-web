import { describe, expect, it } from "vitest";

import { membershipSearchPayers } from "@/features/customers/utils/membership-search-payers";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";

function payer(
  overrides: Partial<OrganizationPayer> = {},
): OrganizationPayer {
  return {
    id: 1,
    uuid: "payer-1",
    name: "MASM",
    code: "MASM",
    description: "",
    phone_number: "",
    email: "",
    address: "",
    registry_payer: 9,
    registry_payer_detail: {
      id: 9,
      uuid: "registry-masm",
      country_code: "MW",
      code: "MASM",
      official_name: "Medical Aid Society of Malawi",
      display_name: "MASM",
      status: "approved",
      integration_code: "MASM",
      capabilities: ["member_search"],
      is_active: true,
    },
    registry_linked_at: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("membershipSearchPayers", () => {
  it("includes only active payers whose registry can search members", () => {
    const results = membershipSearchPayers([
      payer(),
      payer({
        id: 2,
        uuid: "payer-2",
        name: "Local fund",
        registry_payer: null,
        registry_payer_detail: null,
      }),
      payer({
        id: 3,
        uuid: "payer-3",
        registry_payer_detail: {
          id: 10,
          uuid: "registry-claims-only",
          country_code: "MW",
          code: "CLAIMS",
          official_name: "Claims only",
          display_name: "Claims only",
          status: "approved",
          integration_code: "CLAIMS",
          capabilities: ["claim_submit"],
          is_active: true,
        },
      }),
    ]);

    expect(results).toEqual([
      { id: "registry-masm", name: "MASM", payerCode: "MASM" },
    ]);
  });
});
