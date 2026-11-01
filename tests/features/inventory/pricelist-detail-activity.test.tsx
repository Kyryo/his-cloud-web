import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PricelistDetailActivityTab } from "@/features/inventory/components/detail/PricelistDetailActivityTab";

const fetchAuditMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogPricelistAuditEvents: fetchAuditMock,
}));

const PRICELIST = {
  uuid: "pl-1",
  name: "MASM VIP",
  is_active: true,
  currency_code: "MWK",
};

afterEach(() => {
  cleanup();
});

describe("PricelistDetailActivityTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders mapped audit events including sync actions", async () => {
    fetchAuditMock.mockResolvedValue({
      results: [
        {
          uuid: "evt-1",
          action: "catalog.pricelist.masm_core_prices_synced",
          message: "Synced MASM Core prices on MASM VIP (updated=2).",
          actor_name: "Ada Admin",
          created_at: "2026-10-27T10:00:00Z",
        },
        {
          uuid: "evt-2",
          action: "catalog.pricelist.price_change_applied",
          message: "Applied price change",
          actor_name: "Ada Admin",
          created_at: "2026-10-27T09:00:00Z",
        },
      ],
      pagination: null,
    });

    render(<PricelistDetailActivityTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(fetchAuditMock).toHaveBeenCalledWith(PRICELIST.uuid, { pageSize: 50 });
    });
    expect(screen.getByTestId("pricelist-activity-timeline")).toHaveTextContent(
      "MASM Core prices synced",
    );
    expect(screen.getByTestId("pricelist-activity-timeline")).toHaveTextContent(
      "Price change applied",
    );
  });
});
