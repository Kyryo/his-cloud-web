import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAccessToken = vi.fn();
const hmisApiRequest = vi.fn();

vi.mock("@/lib/server/require-access-token", () => ({
  requireAccessToken: (...args: unknown[]) => requireAccessToken(...args),
}));

vi.mock("@/lib/server/hmis-api", () => ({
  hmisApiRequest: (...args: unknown[]) => hmisApiRequest(...args),
}));

describe("clinical OPD queue BFF route", () => {
  beforeEach(() => {
    requireAccessToken.mockResolvedValue({ accessToken: "token-1" });
    hmisApiRequest.mockResolvedValue([]);
  });

  it("forwards queue_stage to Django", async () => {
    const { GET } = await import("@/app/api/clinical/opd/queue/route");
    const request = new Request(
      "http://localhost/api/clinical/opd/queue?queue_stage=triaged&search=jane",
    );

    await GET(request);

    expect(hmisApiRequest).toHaveBeenCalledWith(
      "/clinical/opd/queue/?queue_stage=triaged&search=jane&limit=50",
      { token: "token-1" },
    );
  });
});
