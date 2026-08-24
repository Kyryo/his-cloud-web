import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginWebAuthnStep } from "@/features/auth/components/LoginWebAuthnStep";

describe("LoginWebAuthnStep", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps the security-key step short", () => {
    render(
      <LoginWebAuthnStep
        onVerify={vi.fn()}
        onBack={vi.fn()}
        onTryAnother={vi.fn()}
      />,
    );

    expect(screen.getByTestId("login-webauthn-form")).toHaveTextContent(
      "Security key",
    );
    expect(screen.getByTestId("login-webauthn-submit")).toHaveTextContent(
      "Use security key",
    );
    expect(
      screen.queryByText("Your browser opens a prompt"),
    ).not.toBeInTheDocument();
  });

  it("shows a waiting label while the browser prompt is open", () => {
    render(
      <LoginWebAuthnStep
        isSubmitting
        onVerify={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Waiting for your key");
    expect(screen.getByTestId("login-webauthn-submit")).toBeDisabled();
  });

  it("makes another method easy to choose", () => {
    const onTryAnother = vi.fn();

    render(
      <LoginWebAuthnStep
        onVerify={vi.fn()}
        onBack={vi.fn()}
        onTryAnother={onTryAnother}
      />,
    );

    fireEvent.click(screen.getByTestId("login-try-another-method"));
    expect(onTryAnother).toHaveBeenCalledTimes(1);
  });
});
