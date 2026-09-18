import { afterEach, describe, expect, it, vi } from "vitest";

import { BffError } from "@/lib/bff-client";

const bffRequest = vi.hoisted(() => vi.fn());

vi.mock("@/lib/bff-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/bff-client")>(
    "@/lib/bff-client",
  );
  return {
    ...actual,
    bffRequest: (...args: unknown[]) => bffRequest(...args),
  };
});

afterEach(() => {
  bffRequest.mockReset();
});

describe("clinical-opd.service", () => {
  it("forwards queue_stage on the queue request", async () => {
    bffRequest.mockResolvedValue({ results: [] });
    const { fetchOpdQueue } = await import(
      "@/features/clinical-opd/services/clinical-opd.service"
    );

    await fetchOpdQueue({ queueStage: "triaged", search: "jane" });

    expect(bffRequest).toHaveBeenCalledWith(
      expect.stringContaining("queue_stage=triaged"),
    );
    expect(bffRequest).toHaveBeenCalledWith(
      expect.stringContaining("search=jane"),
    );
  });

  it("treats a missing disposition as empty", async () => {
    bffRequest.mockRejectedValue(new BffError("Not found", 404));
    const { fetchEncounterDisposition } = await import(
      "@/features/clinical-opd/services/clinical-opd.service"
    );

    await expect(
      fetchEncounterDisposition("visit-1", "enc-1"),
    ).resolves.toBeNull();
  });
});
