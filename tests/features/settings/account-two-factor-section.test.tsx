import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountTwoFactorSection } from "@/features/settings/components/AccountTwoFactorSection";
import type { MfaStatus } from "@/features/settings/types/mfa.types";

const idleMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

function defaultStatus(): MfaStatus {
  return {
    email: { enabled: true },
    totp: { enabled: false, created_at: null, last_used_at: null },
    webauthn: [],
    recovery_codes: { enabled: false, unused_count: 0, total_count: 0 },
    preferred_method: "email",
  };
}

const mfaStatus: MfaStatus = defaultStatus();

vi.mock("@/features/settings/hooks/use-mfa", () => ({
  useMfaStatus: () => ({
    data: mfaStatus,
    isLoading: false,
    isError: false,
  }),
  useSetupTotp: () => idleMutation,
  useActivateTotp: () => idleMutation,
  useDeactivateTotp: () => idleMutation,
  useBeginWebAuthnRegistration: () => idleMutation,
  useCompleteWebAuthnRegistration: () => idleMutation,
  useRenameWebAuthn: () => idleMutation,
  useRemoveWebAuthn: () => idleMutation,
  useRevealRecoveryCodes: () => idleMutation,
  useRegenerateRecoveryCodes: () => idleMutation,
  useSetPreferredMfaMethod: () => idleMutation,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("AccountTwoFactorSection", () => {
  afterEach(() => {
    Object.assign(mfaStatus, defaultStatus());
    cleanup();
  });

  it("shows email as required and offers authenticator setup", () => {
    render(<AccountTwoFactorSection />);

    expect(screen.getByTestId("account-mfa-section")).toBeInTheDocument();
    expect(screen.getByText("Sign-in methods")).toBeInTheDocument();
    expect(screen.getByText("Email code")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-setup-totp")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-add-webauthn")).toBeInTheDocument();
  });

  it("does not allow removing the default authenticator app", () => {
    mfaStatus.totp.enabled = true;
    mfaStatus.preferred_method = "totp";
    render(<AccountTwoFactorSection />);

    expect(screen.getByTestId("mfa-remove-totp")).toBeDisabled();
  });

  it("allows removing authenticator when it is not the default", () => {
    mfaStatus.totp.enabled = true;
    mfaStatus.preferred_method = "email";
    render(<AccountTwoFactorSection />);

    expect(screen.getByTestId("mfa-remove-totp")).toBeEnabled();
  });

  it("lists security keys and blocks removing the last default key", () => {
    mfaStatus.webauthn = [
      {
        id: 1,
        name: "YubiKey",
        created_at: "2026-08-01T00:00:00Z",
        last_used_at: null,
      },
    ];
    mfaStatus.preferred_method = "webauthn";
    render(<AccountTwoFactorSection />);

    expect(screen.getByText("Your keys")).toBeInTheDocument();
    expect(screen.getByText("YubiKey")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-remove-webauthn-1")).toBeDisabled();
  });
});
