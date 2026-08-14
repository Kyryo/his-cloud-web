import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginMfaMethodPicker } from "@/features/auth/components/LoginMfaMethodPicker";

describe("LoginMfaMethodPicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists enrolled methods except the current one", () => {
    const onSelect = vi.fn();

    render(
      <LoginMfaMethodPicker
        methods={["email", "totp", "webauthn", "recovery_codes"]}
        currentMethod="email"
        onSelect={onSelect}
        onBack={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("login-mfa-method-email")).toBeNull();
    fireEvent.click(screen.getByTestId("login-mfa-method-totp"));
    expect(onSelect).toHaveBeenCalledWith("totp");
  });

  it("lists email when switching from authenticator app", () => {
    render(
      <LoginMfaMethodPicker
        methods={["email", "totp", "recovery_codes"]}
        currentMethod="totp"
        onSelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByTestId("login-mfa-method-email")).toBeInTheDocument();
    expect(screen.queryByTestId("login-mfa-method-totp")).toBeNull();
  });
});
