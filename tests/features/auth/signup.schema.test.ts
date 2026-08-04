import { describe, expect, it } from "vitest";

import { getPasswordStrength } from "@/features/auth/components/PasswordStrengthMeter";
import {
  signupCredentialsSchema,
  signupOtpSchema,
  signupProfileSchema,
} from "@/features/auth/schemas/signup.schema";

describe("signupCredentialsSchema", () => {
  it("accepts email and password without confirmation", () => {
    const result = signupCredentialsSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = signupCredentialsSchema.safeParse({
      email: "jane@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it("scores empty, weak, and strong passphrases", () => {
    expect(getPasswordStrength("")).toBe("empty");
    expect(getPasswordStrength("abcdefg")).toBe("weak");
    expect(getPasswordStrength("Str0ng-Passphrase-123!")).toBe("strong");
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
