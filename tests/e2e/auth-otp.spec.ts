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

  test("sign-up completes with clinic details and OTP", async ({ page }) => {
    await mockSignupOtpFlow(page);

    await page.goto("/signup");

    await page.getByTestId("signup-email").fill("user@example.com");
    await page.getByTestId("signup-password").fill("Str0ng-Passphrase-123!");
    await page.getByLabel("Confirm password *").fill("Str0ng-Passphrase-123!");
    await page.getByTestId("signup-continue").click();

    await expect(page.getByTestId("signup-profile-form")).toBeVisible();
    await page.getByTestId("signup-name").fill("Jane Doe");
    await page.getByTestId("signup-clinic-name").fill("Lakeview Clinic");
    await page.getByTestId("signup-profile-continue").click();

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
