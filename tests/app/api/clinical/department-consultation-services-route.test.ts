import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAccessTokenMock = vi.hoisted(() => vi.fn());
const hmisApiRequestWithMetaMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/require-access-token", () => ({
  requireAccessToken: requireAccessTokenMock,
}));

vi.mock("@/lib/server/hmis-api", () => ({
  hmisApiRequestWithMeta: hmisApiRequestWithMetaMock,
}));

describe("department consultation services BFF route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAccessTokenMock.mockResolvedValue({ accessToken: "token" });
  });

  it("forwards GET /departments/{uuid}/consultation-services/", async () => {
    hmisApiRequestWithMetaMock.mockResolvedValueOnce({
      data: [{ uuid: "svc-1", name: "General consultation" }],
    });

    const { GET } = await import(
      "@/app/api/clinical/departments/[uuid]/consultation-services/route"
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ uuid: "dept-1" }),
    });

    expect(hmisApiRequestWithMetaMock).toHaveBeenCalledWith(
      "/departments/dept-1/consultation-services/",
      { token: "token" },
    );
    await expect(response.json()).resolves.toEqual({
      results: [{ uuid: "svc-1", name: "General consultation" }],
    });
  });

  it("unwraps paginated Django results", async () => {
    hmisApiRequestWithMetaMock.mockResolvedValueOnce({
      data: {
        count: 1,
        results: [{ uuid: "svc-2", name: "Follow-up" }],
      },
    });

    const { GET } = await import(
      "@/app/api/clinical/departments/[uuid]/consultation-services/route"
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ uuid: "dept-2" }),
    });

    await expect(response.json()).resolves.toEqual({
      results: [{ uuid: "svc-2", name: "Follow-up" }],
    });
  });
});
