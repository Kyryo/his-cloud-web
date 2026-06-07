import { afterEach, describe, expect, it, vi } from "vitest";

import { hmisApiRequest } from "@/lib/server/hmis-api";

describe("hmisApiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps successful v1 envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: "",
          data: { detail: "Verification code sent." },
          meta: { request_id: "req-1" },
          errors: [],
        }),
      }),
    );

    const data = await hmisApiRequest<{ detail: string }>(
      "/auth/signin/request-otp/",
      {
        method: "POST",
        body: { email: "user@example.com", password: "secret" },
      },
    );

    expect(data.detail).toBe("Verification code sent.");
  });

  it("throws HmisApiError with v1 field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: "Request failed",
          data: null,
          meta: { request_id: "req-2" },
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
      hmisApiRequest("/auth/signup/request-otp/", {
        method: "POST",
        body: { email: "user@example.com", password: "weak" },
      }),
    ).rejects.toMatchObject({
      name: "HmisApiError",
      message: "Password is too weak.",
    });
  });
});
