import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_AUTH_ROUTES } from "@/constants/api";
import {
  requestSigninOtp,
  verifySignin,
  verifySignup,
} from "@/features/auth/services/auth.service";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

import { bffRequest } from "@/lib/bff-client";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests signin otp via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ detail: "Verification code sent." });

    const result = await requestSigninOtp({
      email: "User@Example.com",
      password: "Str0ng-Passphrase-123!",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signinRequestOtp, {
      method: "POST",
      body: {
        email: "user@example.com",
        password: "Str0ng-Passphrase-123!",
      },
    });
    expect(result.detail).toBe("Verification code sent.");
  });

  it("verifies signin via the BFF without exposing tokens", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      user: { id: 1, email: "user@example.com" },
    });

    const result = await verifySignin({ email: "user@example.com", code: "123456" });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signinVerify, {
      method: "POST",
      body: { email: "user@example.com", code: "123456" },
    });
    expect(result.user.email).toBe("user@example.com");
    expect(result).not.toHaveProperty("tokens");
  });

  it("verifies signup with clinic details via the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      user: { id: 2, email: "jane@example.com" },
    });

    await verifySignup({
      email: "jane@example.com",
      password: "Str0ng-Passphrase-123!",
      name: "Jane Doe",
      clinic_name: "Lakeview Clinic",
      country: "Malawi",
      code: "123456",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signupVerify, {
      method: "POST",
      body: {
        email: "jane@example.com",
        password: "Str0ng-Passphrase-123!",
        name: "Jane Doe",
        clinic_name: "Lakeview Clinic",
        country: "Malawi",
        code: "123456",
      },
    });
  });
});
