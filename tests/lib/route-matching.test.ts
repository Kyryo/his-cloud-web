import { describe, expect, it } from "vitest";

import { matchesRoute } from "@/lib/route-matching";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/constants/routes";

describe("matchesRoute", () => {
  it("matches exact and nested protected routes", () => {
    expect(matchesRoute("/onboarding", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/onboarding/setup", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/customers", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/customers/abc-123", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/settings/account", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/settings/organization", PROTECTED_ROUTES)).toBe(true);
    expect(matchesRoute("/auth", PROTECTED_ROUTES)).toBe(false);
  });

  it("matches auth routes", () => {
    expect(matchesRoute("/auth", AUTH_ROUTES)).toBe(true);
    expect(matchesRoute("/signup", AUTH_ROUTES)).toBe(true);
    expect(matchesRoute("/", AUTH_ROUTES)).toBe(false);
  });
});
