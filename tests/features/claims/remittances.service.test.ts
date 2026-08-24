import { beforeEach, describe, expect, it, vi } from "vitest";

import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import {
  applyRemittanceRow,
  deleteRemittanceBatch,
  fetchRemittanceBatch,
  fetchRemittanceBatches,
  fetchRemittanceRows,
  renameRemittanceBatch,
  uploadRemittanceBatch,
} from "@/features/claims/services/remittances.service";
import { bffRequest } from "@/lib/bff-client";

vi.mock("@/lib/bff-client", () => ({
  bffRequest: vi.fn(),
  BffError: class BffError extends Error {
    status: number;
    constructor(message: string, status = 500) {
      super(message);
      this.status = status;
    }
  },
}));

describe("remittances.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists remittance batches with status filter", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [],
      pagination: { count: 0 },
    });
    await fetchRemittanceBatches({ status: "processed", page: 2 });
    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CLAIMS_ROUTES.remittances}?page=2&status=processed`,
    );
  });

  it("fetches remittance batch detail", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 9 });
    await fetchRemittanceBatch(9);
    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.remittanceDetail(9));
  });

  it("deletes a remittance batch", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce(null);
    await deleteRemittanceBatch(9);
    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.remittanceDetail(9), {
      method: "DELETE",
    });
  });

  it("renames a remittance batch", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      id: 9,
      display_filename: "January remittance.pdf",
    });
    await renameRemittanceBatch(9, "January remittance.pdf");
    expect(bffRequest).toHaveBeenCalledWith(BFF_CLAIMS_ROUTES.remittanceRename(9), {
      method: "POST",
      body: { display_filename: "January remittance.pdf" },
    });
  });

  it("fetches paginated remittance rows", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      results: [],
      pagination: { count: 0 },
    });
    await fetchRemittanceRows(9, { page: 2, pageSize: 20, search: "chikondi" });
    expect(bffRequest).toHaveBeenCalledWith(
      `${BFF_CLAIMS_ROUTES.remittanceRows(9)}?page=2&page_size=20&search=chikondi`,
    );
  });

  it("uploads remittance as FormData", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({ id: 1, status: "queued" });
    const file = new File(["pdf"], "advice.pdf", { type: "application/pdf" });
    await uploadRemittanceBatch({ file, payerCode: "MASM" });
    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CLAIMS_ROUTES.remittances,
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
  });

  it("applies a remittance row", async () => {
    vi.mocked(bffRequest).mockResolvedValueOnce({
      row: { id: 3, resolution_status: "manually_resolved" },
    });
    await applyRemittanceRow(1, 3);
    expect(bffRequest).toHaveBeenCalledWith(
      BFF_CLAIMS_ROUTES.remittanceRowApply(1, 3),
      { method: "POST" },
    );
  });
});
