import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/constants/session";
import { proxy } from "@/proxy";

function request(
  url: string,
  host: string,
  cookies?: string,
) {
  return new NextRequest(url, {
    headers: {
      host,
      ...(cookies ? { cookie: cookies } : {}),
    },
  });
}

describe("proxy host routing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not redirect on localhost when host routing is disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_DISABLE_HOST_ROUTING", "true");
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "");

    const response = proxy(request("http://localhost:3000/customers", "localhost:3000"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/auth");
  });

  it("sends localhost dashboard URLs to app.localhost in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "");

    const response = proxy(
      request("http://localhost:3000/customers", "localhost:3000"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://app.localhost:3000/customers",
    );
  });

  it("sends old dashboard URLs to the app host", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    const response = proxy(
      request("https://sigmahmis.com/customers/abc", "sigmahmis.com"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://app.sigmahmis.com/customers/abc",
    );
  });

  it("sends www marketing auth links to the app host", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    const response = proxy(
      request("https://www.sigmahmis.com/auth", "www.sigmahmis.com"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://app.sigmahmis.com/auth",
    );
  });

  it("sends the app apex to sign-in when there is no session", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    const response = proxy(request("https://app.sigmahmis.com/", "app.sigmahmis.com"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.sigmahmis.com/auth",
    );
  });

  it("sends a logged-in app apex to clients", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    const response = proxy(
      request("https://app.sigmahmis.com/", "app.sigmahmis.com", [
        `${ACCESS_TOKEN_COOKIE}=access`,
        `${REFRESH_TOKEN_COOKIE}=refresh`,
      ].join("; ")),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://app.sigmahmis.com/customers",
    );
  });

  it("sends marketing pages on the app host back to marketing", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    const response = proxy(
      request("https://app.sigmahmis.com/pricing", "app.sigmahmis.com"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://sigmahmis.com/pricing",
    );
  });
});
