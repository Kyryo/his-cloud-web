import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SignUpForm } from "@/features/auth/components/SignUpForm";

const requestSignupOtp = vi.fn();
const verifySignupEmail = vi.fn();
const verifySignup = vi.fn();
const configureOnboardingModules = vi.fn();
const markAuthenticatedSession = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock("@/features/auth/services/auth.service", () => ({
  requestSignupOtp: (...args: unknown[]) => requestSignupOtp(...args),
  verifySignupEmail: (...args: unknown[]) => verifySignupEmail(...args),
  verifySignup: (...args: unknown[]) => verifySignup(...args),
  markAuthenticatedSession: (...args: unknown[]) => markAuthenticatedSession(...args),
}));

vi.mock("@/features/auth/services/onboarding.service", () => ({
  configureOnboardingModules: (...args: unknown[]) =>
    configureOnboardingModules(...args),
}));

describe("SignUpForm step split", () => {
  beforeEach(() => {
    requestSignupOtp.mockReset();
    verifySignupEmail.mockReset();
    verifySignup.mockReset();
    configureOnboardingModules.mockReset();
    markAuthenticatedSession.mockReset();
    push.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows clinic + country first, then name with account credentials", async () => {
    render(<SignUpForm />);

    expect(screen.getByTestId("signup-clinic-name")).toBeInTheDocument();
    expect(screen.getByTestId("signup-country")).toBeInTheDocument();
    expect(screen.queryByTestId("signup-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("signup-email")).not.toBeInTheDocument();
    expect(screen.queryByTestId("signup-password")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("signup-clinic-name"), {
      target: { value: "Lakeview Clinic" },
    });
    fireEvent.click(screen.getByTestId("signup-continue"));

    expect(screen.queryByRole("heading", { name: /What departments/ })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("signup-name")).toBeInTheDocument();
    });
    expect(screen.getByTestId("signup-email")).toBeInTheDocument();
    expect(screen.getByTestId("signup-password")).toBeInTheDocument();
    expect(screen.queryByTestId("signup-clinic-name")).not.toBeInTheDocument();
    expect(requestSignupOtp).not.toHaveBeenCalled();
  });

  it("shows Working while the verification code is requested and disables the fields", async () => {
    let resolveOtp: (value: unknown) => void = () => {};
    requestSignupOtp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOtp = resolve;
        }),
    );

    render(<SignUpForm />);
    fireEvent.change(screen.getByTestId("signup-clinic-name"), {
      target: { value: "Lakeview Clinic" },
    });
    fireEvent.click(screen.getByTestId("signup-continue"));

    await waitFor(() => {
      expect(screen.getByTestId("signup-name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("signup-name"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByTestId("signup-email"), {
      target: { value: "ada@lakeview.test" },
    });
    fireEvent.change(screen.getByTestId("signup-password"), {
      target: { value: "password1" },
    });
    fireEvent.click(screen.getByTestId("signup-account-continue"));

    expect(await screen.findByText("Working…")).toBeInTheDocument();
    expect(screen.getByTestId("signup-name")).toBeDisabled();
    expect(screen.getByTestId("signup-email")).toBeDisabled();
    expect(screen.getByTestId("signup-password")).toBeDisabled();

    resolveOtp(undefined);

    await waitFor(() => {
      expect(screen.getByTestId("signup-submit")).toBeInTheDocument();
    });
    expect(requestSignupOtp).toHaveBeenCalledWith({
      email: "ada@lakeview.test",
      password: "password1",
    });
  });
});
