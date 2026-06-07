import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BFF_CUSTOMER_ADDRESSES_ROUTES,
  BFF_CUSTOMERS_ROUTES,
  BFF_INSURANCE_ROUTES,
} from "@/constants/api";
import { createCustomerAddress } from "@/features/customers/services/customer-addresses.service";
import { createCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

describe("customer insurance and address services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches active insurance schemes via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      results: [{ id: 1, name: "Scheme A", is_active: true }],
    });

    const schemes = await fetchInsuranceSchemes();

    expect(bffRequest).toHaveBeenCalledWith(BFF_INSURANCE_ROUTES.schemes);
    expect(schemes).toEqual([{ id: 1, name: "Scheme A", is_active: true }]);
  });

  it("creates customer insurance via the BFF", async () => {
    const payload = {
      insurance_scheme: 1,
      membership_number: "MEM123",
      suffix: "001",
      is_principal_member: true,
    };

    vi.mocked(bffRequest).mockResolvedValue({ uuid: "insurance-uuid" });

    await createCustomerInsurance("customer-uuid", payload);

    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CUSTOMERS_ROUTES.insurance("customer-uuid"),
      {
        method: "POST",
        body: payload,
      },
    );
  });

  it("creates customer address via the BFF", async () => {
    const payload = {
      customer: 42,
      address_type: "HOME" as const,
      line1: "123 Main Street",
    };

    vi.mocked(bffRequest).mockResolvedValue({ uuid: "address-uuid" });

    await createCustomerAddress(payload);

    expect(bffRequest).toHaveBeenCalledWith(BFF_CUSTOMER_ADDRESSES_ROUTES.list, {
      method: "POST",
      body: payload,
    });
  });
});
