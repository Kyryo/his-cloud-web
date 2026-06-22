import type { BrowserContext, Page, Route } from "@playwright/test";

export const MOCK_USER = {
  id: 1,
  name: "Test User",
  url: "/api/v1/users/1/",
  email: "user@example.com",
  permissions: {},
  is_admin: false,
  location: null,
  groups: [],
  tenant: null,
  clinics: null,
  locations: null,
  primary_clinic: null,
  primary_location: null,
};

async function addAuthCookies(context: BrowserContext, hostname: string): Promise<void> {
  await context.addCookies([
    {
      name: "hmis_access",
      value: "mock-access-token",
      domain: hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "hmis_refresh",
      value: "mock-refresh-token",
      domain: hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

export async function setAuthCookies(page: Page): Promise<void> {
  const hostname = new URL(page.url()).hostname;
  await addAuthCookies(page.context(), hostname);
}

function createSessionRouteHandler(getAuthenticated: () => boolean) {
  return async (route: Route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    const authenticated = getAuthenticated();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        authenticated
          ? { authenticated: true, user: MOCK_USER }
          : { authenticated: false },
      ),
    });
  };
}

export async function mockUnauthenticatedSession(page: Page): Promise<void> {
  await page.route("**/api/auth/session", createSessionRouteHandler(() => false));
}

export async function mockAuthenticatedSession(page: Page): Promise<void> {
  await page.route("**/api/auth/session", createSessionRouteHandler(() => true));
  await page.route("**/api/auth/me", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });
}

async function fulfillVerify(route: Route, status: number): Promise<void> {
  const hostname = new URL(route.request().url()).hostname;
  await addAuthCookies(route.request().frame().page().context(), hostname);

  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ user: MOCK_USER }),
  });
}

export async function mockCustomersList(page: Page): Promise<void> {
  await page.route("**/api/customers**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: [],
        pagination: { count: 0, next: null, previous: null },
      }),
    });
  });
}

export async function mockSigninOtpFlow(page: Page): Promise<void> {
  let authenticated = false;

  await page.route("**/api/auth/session", createSessionRouteHandler(() => authenticated));
  await mockCustomersList(page);
  await page.route("**/api/auth/me", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });

  await page.route("**/api/auth/signin/request-otp", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Verification code sent." }),
    });
  });

  await page.route("**/api/auth/signin/verify", async (route) => {
    authenticated = true;
    await fulfillVerify(route, 200);
  });
}

export async function mockSignupOtpFlow(page: Page): Promise<void> {
  let authenticated = false;

  await page.route("**/api/auth/session", createSessionRouteHandler(() => authenticated));
  await mockCustomersList(page);
  await page.route("**/api/auth/me", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: MOCK_USER }),
    });
  });

  await page.route("**/api/auth/signup/request-otp", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Verification code sent." }),
    });
  });

  await page.route("**/api/auth/signup/verify-email", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Email verified successfully.",
        verification_token: "mock-verification-token",
      }),
    });
  });

  await page.route("**/api/auth/signup/verify", async (route) => {
    authenticated = true;
    await fulfillVerify(route, 201);
  });

  await page.route("**/api/onboarding/modules", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    await route.continue();
  });
}
