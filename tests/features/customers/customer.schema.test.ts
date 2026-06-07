import { describe, expect, it } from "vitest";

import {
  createCustomerSchema,
  toCreateCustomerPayload,
} from "@/features/customers/schemas/customer.schema";

describe("createCustomerSchema", () => {
  it("accepts valid customer input", () => {
    const result = createCustomerSchema.safeParse({
      first_name: "Ada",
      middle_name: "Grace",
      last_name: "Lovelace",
      gender: "Female",
      dob: "1815-12-10",
      dob_is_estimated: false,
      phone_number: "+254712345678",
      email: "ada@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects identical first and last names", () => {
    const result = createCustomerSchema.safeParse({
      first_name: "John",
      middle_name: "",
      last_name: "John",
      gender: "Male",
      dob: "",
      dob_is_estimated: false,
      phone_number: "",
      email: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid email when provided", () => {
    const result = createCustomerSchema.safeParse({
      first_name: "Jane",
      middle_name: "",
      last_name: "Doe",
      gender: "Female",
      dob: "",
      dob_is_estimated: false,
      phone_number: "",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("allows blank optional fields", () => {
    const result = createCustomerSchema.safeParse({
      first_name: "Jane",
      middle_name: "",
      last_name: "Doe",
      gender: "Other",
      dob: "",
      dob_is_estimated: false,
      phone_number: "",
      email: "",
    });

    expect(result.success).toBe(true);
  });
});

describe("toCreateCustomerPayload", () => {
  it("maps form values to API payload", () => {
    expect(
      toCreateCustomerPayload({
        first_name: " Ada ",
        middle_name: " Grace ",
        last_name: " Lovelace ",
        gender: "Female",
        dob: "1815-12-10",
        dob_is_estimated: true,
        phone_number: " 0712345678 ",
        email: " ada@example.com ",
      }),
    ).toEqual({
      first_name: "Ada",
      middle_name: "Grace",
      last_name: "Lovelace",
      gender: "Female",
      dob: "1815-12-10",
      dob_is_estimated: true,
      phone_number: "0712345678",
      email: "ada@example.com",
    });
  });
});
