import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_AUTH_ROUTES } from "@/constants/api";
import {
  requestSigninOtp,
  verifySignin,
  verifySigninRecovery,
  verifySigninTotp,
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
    vi.mocked(bffRequest).mockResolvedValue({
      detail: "Verification code sent.",
      pending_mfa_token: "pending-token",
      methods: ["email"],
    });

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

    const result = await verifySignin({
      email: "user@example.com",
      code: "123456",
      pending_mfa_token: "pending-token",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signinVerify, {
      method: "POST",
      body: {
        email: "user@example.com",
        code: "123456",
        pending_mfa_token: "pending-token",
      },
    });
    expect(result.user.email).toBe("user@example.com");
    expect(result).not.toHaveProperty("tokens");
  });

  it("verifies TOTP via the BFF with the pending challenge token", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      user: { id: 1, email: "user@example.com" },
    });

    await verifySigninTotp({
      pending_mfa_token: "pending-token",
      code: "654321",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signinTotp, {
      method: "POST",
      body: {
        pending_mfa_token: "pending-token",
        code: "654321",
      },
    });
  });

  it("verifies a recovery code via the BFF with the pending challenge token", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      user: { id: 1, email: "user@example.com" },
    });

    await verifySigninRecovery({
      pending_mfa_token: "pending-token",
      code: "12345678",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.signinRecovery, {
      method: "POST",
      body: {
        pending_mfa_token: "pending-token",
        code: "12345678",
      },
    });
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
