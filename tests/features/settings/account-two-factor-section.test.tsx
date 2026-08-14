import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountTwoFactorSection } from "@/features/settings/components/AccountTwoFactorSection";
import type { MfaStatus } from "@/features/settings/types/mfa.types";

const idleMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
};

const mfaStatus: MfaStatus = {
  email: { enabled: true },
  totp: { enabled: false, created_at: null, last_used_at: null },
  webauthn: [],
  recovery_codes: { enabled: false, unused_count: 0, total_count: 0 },
};

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
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("AccountTwoFactorSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows email as required and offers authenticator setup", () => {
    render(<AccountTwoFactorSection />);

    expect(screen.getByTestId("account-mfa-section")).toBeInTheDocument();
    expect(screen.getByText("Sign-in methods")).toBeInTheDocument();
    expect(screen.getByText("Email code")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-setup-totp")).toBeInTheDocument();
    expect(screen.getByTestId("mfa-add-webauthn")).toBeInTheDocument();
  });
});
