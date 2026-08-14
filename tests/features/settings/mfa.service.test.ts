import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_AUTH_ROUTES } from "@/constants/api";
import {
  activateTotp,
  fetchMfaStatus,
  revealRecoveryCodes,
  setPreferredMfaMethod,
  setupTotp,
} from "@/features/settings/services/mfa.service";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
}));

import { bffRequest } from "@/lib/bff-client";

describe("mfa.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads MFA status from the BFF", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      email: { enabled: true },
      totp: { enabled: false, created_at: null, last_used_at: null },
      webauthn: [],
      recovery_codes: { enabled: false, unused_count: 0, total_count: 0 },
      preferred_method: "email",
    });

    const status = await fetchMfaStatus();

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.mfa);
    expect(status.email.enabled).toBe(true);
  });

  it("sets up and activates TOTP with the current password", async () => {
    vi.mocked(bffRequest)
      .mockResolvedValueOnce({
        secret: "SECRET",
        otpauth_url: "otpauth://totp/test",
        qr_svg: "<svg></svg>",
      })
      .mockResolvedValueOnce({ recovery_codes: ["12345678"] });

    await setupTotp("Str0ng-Passphrase-123!");
    await activateTotp({ password: "Str0ng-Passphrase-123!", code: "123456" });

    expect(bffRequest).toHaveBeenNthCalledWith(1, BFF_AUTH_ROUTES.mfaTotpSetup, {
      method: "POST",
      body: { password: "Str0ng-Passphrase-123!" },
    });
    expect(bffRequest).toHaveBeenNthCalledWith(2, BFF_AUTH_ROUTES.mfaTotpActivate, {
      method: "POST",
      body: { password: "Str0ng-Passphrase-123!", code: "123456" },
    });
  });

  it("reveals unused recovery codes with the current password", async () => {
    vi.mocked(bffRequest).mockResolvedValue({
      unused_codes: ["11111111", "22222222"],
    });

    const result = await revealRecoveryCodes("Str0ng-Passphrase-123!");

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.mfaRecoveryCodesReveal, {
      method: "POST",
      body: { password: "Str0ng-Passphrase-123!" },
    });
    expect(result.unused_codes).toHaveLength(2);
  });

  it("sets the preferred sign-in method with the current password", async () => {
    vi.mocked(bffRequest).mockResolvedValue({ preferred_method: "totp" });

    await setPreferredMfaMethod({
      password: "Str0ng-Passphrase-123!",
      method: "totp",
    });

    expect(bffRequest).toHaveBeenCalledWith(BFF_AUTH_ROUTES.mfaPreferred, {
      method: "POST",
      body: { password: "Str0ng-Passphrase-123!", method: "totp" },
    });
  });
});
