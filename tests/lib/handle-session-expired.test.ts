import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  handleSessionExpired,
  isAuthBffPath,
} from "@/lib/handle-session-expired";

describe("isAuthBffPath", () => {
  it("identifies auth BFF routes", () => {
    expect(isAuthBffPath("/api/auth/session")).toBe(true);
    expect(isAuthBffPath("/api/auth/signin/request-otp")).toBe(true);
    expect(isAuthBffPath("/api/customers")).toBe(false);
  });
});

describe("handleSessionExpired", () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal("location", {
      pathname: "/customers",
      replace,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("clears the session and redirects to auth", async () => {
    await handleSessionExpired();

    expect(fetch).toHaveBeenCalledWith("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
    expect(replace).toHaveBeenCalledWith(ROUTES.auth);
  });
});
