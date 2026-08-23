import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isAppHostname,
  isHostRoutingEnabled,
  isMarketingHostname,
  requestHostname,
} from "@/constants/hosts";
import { appHref } from "@/lib/app-url";
import { isAppRoute, isMarketingRoute } from "@/lib/route-matching";

describe("host routing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays off when host routing is disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_DISABLE_HOST_ROUTING", "true");
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "");
    expect(isHostRoutingEnabled()).toBe(false);
    expect(appHref("/auth")).toBe("/auth");
  });

  it("defaults to app.localhost in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "");
    expect(isHostRoutingEnabled()).toBe(true);
    expect(appHref("/customers")).toBe("http://app.localhost:3000/customers");
  });

  it("recognizes the app host and www marketing aliases", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_HOST", "app.sigmahmis.com");
    vi.stubEnv("NEXT_PUBLIC_MARKETING_HOST", "sigmahmis.com");

    expect(isHostRoutingEnabled()).toBe(true);
    expect(isAppHostname("app.sigmahmis.com:443")).toBe(true);
    expect(isMarketingHostname("www.sigmahmis.com")).toBe(true);
    expect(isMarketingHostname("sigmahmis.com")).toBe(true);
    expect(isAppHostname("sigmahmis.com")).toBe(false);
    expect(appHref("/auth")).toBe("https://app.sigmahmis.com/auth");
  });

  it("reads the first forwarded host", () => {
    expect(requestHostname("app.sigmahmis.com, sigmahmis.com")).toBe(
      "app.sigmahmis.com",
    );
  });
});

describe("app vs marketing routes", () => {
  it("keeps dashboard and auth on the app host", () => {
    expect(isAppRoute("/customers")).toBe(true);
    expect(isAppRoute("/customers/abc")).toBe(true);
    expect(isAppRoute("/auth/register")).toBe(true);
    expect(isAppRoute("/signup")).toBe(true);
    expect(isAppRoute("/api/auth/session")).toBe(true);
    expect(isAppRoute("/about")).toBe(false);
  });

  it("keeps marketing pages on the public host", () => {
    expect(isMarketingRoute("/")).toBe(true);
    expect(isMarketingRoute("/solutions/billing")).toBe(true);
    expect(isMarketingRoute("/customers")).toBe(false);
  });
});
