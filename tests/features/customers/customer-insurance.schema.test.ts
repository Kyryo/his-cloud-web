import { describe, expect, it } from "vitest";

import {
  createCustomerAddressDefaultValues,
  createCustomerAddressSchema,
  toCustomerAddressPayload,
} from "@/features/customers/schemas/customer-address.schema";
import {
  applyPrincipalMemberDefaults,
  createCustomerInsuranceDefaultValues,
  createCustomerInsuranceSchema,
  toCustomerInsurancePayload,
} from "@/features/customers/schemas/customer-insurance.schema";

describe("customer-insurance.schema", () => {
  it("requires scheme, membership number, and suffix", () => {
    const result = createCustomerInsuranceSchema.safeParse(
      createCustomerInsuranceDefaultValues,
    );

    expect(result.success).toBe(false);
  });

  it("maps form values to API payload", () => {
    const values = {
      ...createCustomerInsuranceDefaultValues,
      insurance_scheme: 12,
      membership_number: "MEM123",
      suffix: "001",
      is_principal_member: true,
      principal_member_name: "Jane Doe",
      relationship_to_principal_member: "Self",
    };

    expect(toCustomerInsurancePayload(values)).toEqual({
      insurance_scheme: 12,
      membership_number: "MEM123",
      suffix: "001",
      is_principal_member: true,
      principal_member_name: "Jane Doe",
      relationship_to_principal_member: "Self",
      is_primary: false,
      is_active: true,
      date_joined: values.date_joined,
    });
  });

  it("omits date joined when marked not available", () => {
    const values = {
      ...createCustomerInsuranceDefaultValues,
      insurance_scheme: 12,
      membership_number: "MEM123",
      suffix: "001",
      is_principal_member: true,
      principal_member_name: "Jane Doe",
      relationship_to_principal_member: "Self",
      date_joined_not_available: true,
      date_joined: "",
    };

    expect(toCustomerInsurancePayload(values).date_joined).toBeUndefined();
  });

  it("fills principal member defaults when checked", () => {
    expect(
      applyPrincipalMemberDefaults(
        createCustomerInsuranceDefaultValues,
        "Jane Doe",
        true,
      ),
    ).toEqual({
      ...createCustomerInsuranceDefaultValues,
      is_principal_member: true,
      principal_member_name: "Jane Doe",
      relationship_to_principal_member: "Self",
    });
  });

  it("requires a dependent relationship", () => {
    const result = createCustomerInsuranceSchema.safeParse({
      ...createCustomerInsuranceDefaultValues,
      insurance_scheme: 12,
      membership_number: "MEM123",
      suffix: "001",
      principal_member_name: "Jane Doe",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.flatten().fieldErrors
          .relationship_to_principal_member,
      ).toContain("Relationship to principal member is required.");
    }
  });

  it("rejects Self as a dependent relationship", () => {
    const result = createCustomerInsuranceSchema.safeParse({
      ...createCustomerInsuranceDefaultValues,
      insurance_scheme: 12,
      membership_number: "MEM123",
      suffix: "001",
      principal_member_name: "Jane Doe",
      relationship_to_principal_member: "Self",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.flatten().fieldErrors
          .relationship_to_principal_member,
      ).toContain("A dependent's relationship cannot be Self.");
    }
  });
});

describe("customer-address.schema", () => {
  it("requires address line 1", () => {
    const result = createCustomerAddressSchema.safeParse(
      createCustomerAddressDefaultValues,
    );

    expect(result.success).toBe(false);
  });

  it("maps form values to API payload", () => {
    const values = {
      ...createCustomerAddressDefaultValues,
      line1: "123 Main Street",
      city: "Lilongwe",
    };

    expect(toCustomerAddressPayload(42, values)).toEqual({
      customer: 42,
      address_type: "HOME",
      line1: "123 Main Street",
      line2: "",
      city: "Lilongwe",
      state_province: "",
      postal_code: "",
      country: "",
      is_primary: true,
      notes: "",
      is_active: true,
    });
  });
});
