import { expect, test } from "@playwright/test";

import {
  mockAuthenticatedSession,
  mockSigninOtpFlow,
  mockSignupOtpFlow,
  mockUnauthenticatedSession,
  setAuthCookies,
} from "./helpers/auth-mocks";
import { fillVerificationCode } from "./helpers/fill-verification-code";

test.describe("OTP auth flow", () => {
  test("sign-in completes with OTP and lands on customers", async ({ page }) => {
    await mockSigninOtpFlow(page);

    await page.goto("/auth");

    await page.getByTestId("login-email").fill("user@example.com");
    await page.getByTestId("login-password").fill("Str0ng-Passphrase-123!");
    await page.getByTestId("login-continue").click();

    await expect(page.getByTestId("login-otp-form")).toBeVisible();
    await fillVerificationCode(page, "login-otp", "123456");
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/customers$/);
  });

  test("hides try another method when only email is available", async ({ page }) => {
    await mockSigninOtpFlow(page);

    await page.goto("/auth");
    await page.getByTestId("login-email").fill("user@example.com");
    await page.getByTestId("login-password").fill("Str0ng-Passphrase-123!");
    await page.getByTestId("login-continue").click();

    await expect(page.getByTestId("login-otp-form")).toBeVisible();
    await expect(page.getByTestId("login-try-another-method")).toHaveCount(0);
  });

  test("shows try another method when totp is enrolled", async ({ page }) => {
    await mockSigninOtpFlow(page, ["email", "totp", "recovery_codes"]);

    await page.goto("/auth");
    await page.getByTestId("login-email").fill("user@example.com");
    await page.getByTestId("login-password").fill("Str0ng-Passphrase-123!");
    await page.getByTestId("login-continue").click();

    await expect(page.getByTestId("login-otp-form")).toBeVisible();
    await page.getByTestId("login-try-another-method").click();
    await expect(page.getByTestId("login-mfa-methods")).toBeVisible();
    await page.getByTestId("login-mfa-method-totp").click();
    await expect(page.getByTestId("login-totp-form")).toBeVisible();
  });

  test("sign-up completes with clinic details and OTP", async ({ page }) => {
    await mockSignupOtpFlow(page);

    await page.goto("/signup");

    await page.getByTestId("signup-clinic-name").fill("Lakeview Clinic");
    await page.getByTestId("signup-continue").click();

    await page.getByTestId("signup-name").fill("Jane Doe");
    await page.getByTestId("signup-email").fill("user@example.com");
    await page.getByTestId("signup-password").fill("Str0ng-Passphrase-123!");
    await page.getByTestId("signup-account-continue").click();

    await expect(page.getByTestId("signup-otp-form")).toBeVisible();
    await fillVerificationCode(page, "signup-otp", "123456");
    await page.getByTestId("signup-submit").click();

    await expect(page).toHaveURL(/\/customers$/);
  });

  test("redirects unauthenticated users away from customers", async ({ page }) => {
    await mockUnauthenticatedSession(page);

    await page.goto("/customers");

    await expect(page).toHaveURL(/\/auth$/);
  });

  test("redirects authenticated users away from auth pages", async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto("/auth");
    await setAuthCookies(page);
    await page.goto("/auth");

    await expect(page).toHaveURL(/\/customers$/);
  });
});
