import { describe, expect, it, vi } from "vitest";

const handleClinicalObjectGet = vi.fn();

vi.mock("@/lib/server/clinical-bff-handlers", () => ({
  handleClinicalObjectGet: (...args: unknown[]) => handleClinicalObjectGet(...args),
}));

describe("clinical encounter timeline BFF route", () => {
  it("forwards the request and encounter timeline path", async () => {
    handleClinicalObjectGet.mockResolvedValue(new Response(null, { status: 200 }));

    const { GET } = await import(
      "@/app/api/clinical/opd/visits/[visitUuid]/encounters/[encounterUuid]/timeline/route"
    );
    const request = new Request(
      "http://localhost/api/clinical/opd/visits/visit-1/encounters/enc-1/timeline",
    );

    await GET(request, {
      params: Promise.resolve({
        visitUuid: "visit-1",
        encounterUuid: "enc-1",
      }),
    });

    expect(handleClinicalObjectGet).toHaveBeenCalledWith(
      request,
      "/clinical/visits/visit-1/encounters/enc-1/timeline/",
    );
  });
});
