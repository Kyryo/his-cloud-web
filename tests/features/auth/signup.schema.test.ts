import { describe, expect, it } from "vitest";

import {
  signupCredentialsSchema,
  signupOtpSchema,
  signupProfileSchema,
} from "@/features/auth/schemas/signup.schema";

describe("signupCredentialsSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = signupCredentialsSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
      password2: "different",
    });

    expect(result.success).toBe(false);
  });
});

describe("signupProfileSchema", () => {
  it("requires clinic name", () => {
    const result = signupProfileSchema.safeParse({
      name: "Jane Doe",
      clinic_name: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid profile details", () => {
    const result = signupProfileSchema.safeParse({
      name: "Jane Doe",
      clinic_name: "Lakeview Clinic",
      country: "Malawi",
    });

    expect(result.success).toBe(true);
  });
});

describe("signupOtpSchema", () => {
  it("requires a 6-digit verification code", () => {
    const result = signupOtpSchema.safeParse({ code: "12" });
    expect(result.success).toBe(false);
  });
});
