import { describe, expect, it } from "vitest";

import {
  signinCredentialsSchema,
  signinOtpSchema,
} from "@/features/auth/schemas/login.schema";

describe("signinCredentialsSchema", () => {
  it("accepts valid credentials", () => {
    const result = signinCredentialsSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signinCredentialsSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });

    expect(result.success).toBe(false);
  });
});

describe("signinOtpSchema", () => {
  it("requires a 6-digit code", () => {
    const result = signinOtpSchema.safeParse({
      email: "user@example.com",
      code: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid otp payload", () => {
    const result = signinOtpSchema.safeParse({
      email: "user@example.com",
      code: "123456",
    });

    expect(result.success).toBe(true);
  });
});
