import { afterEach, describe, expect, it, vi } from "vitest";

import { bffRequest } from "@/lib/bff-client";

describe("bffRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns successful BFF JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ detail: "Verification code sent." }),
      }),
    );

    const data = await bffRequest<{ detail: string }>("/api/auth/signin/request-otp", {
      method: "POST",
      body: { email: "user@example.com", password: "secret" },
    });

    expect(data.detail).toBe("Verification code sent.");
  });

  it("redirects to auth on 401 for protected routes", async () => {
    const replace = vi.fn();
    vi.stubGlobal("location", {
      pathname: "/inventory/products",
      replace,
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: "Not authenticated." }),
        })
        .mockResolvedValueOnce({ ok: true }),
    );

    await expect(bffRequest("/api/inventory/products/search")).rejects.toMatchObject({
      name: "BffError",
      status: 401,
    });

    expect(replace).toHaveBeenCalledWith("/auth");
  });

  it("does not redirect on 401 for auth sign-in routes", async () => {
    const replace = vi.fn();
    vi.stubGlobal("location", {
      pathname: "/auth",
      replace,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials." }),
      }),
    );

    await expect(
      bffRequest("/api/auth/signin/request-otp", {
        method: "POST",
        body: { email: "user@example.com", password: "wrong" },
      }),
    ).rejects.toMatchObject({
      name: "BffError",
      status: 401,
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("throws BffError with server error messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: "Password is too weak.",
          errors: [
            {
              code: "invalid",
              field: "password",
              message: "Password is too weak.",
            },
          ],
        }),
      }),
    );

    await expect(
      bffRequest("/api/auth/signup/request-otp", {
        method: "POST",
        body: { email: "user@example.com", password: "weak" },
      }),
    ).rejects.toMatchObject({
      name: "BffError",
      message: "Password is too weak.",
    });
  });
});
