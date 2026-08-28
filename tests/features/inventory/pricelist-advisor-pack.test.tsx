import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PricelistDetailSummaryTab } from "@/features/inventory/components/detail/PricelistDetailSummaryTab";

const fetchPricelistValidationConfigMock = vi.hoisted(() => vi.fn());
const updatePricelistValidationConfigMock = vi.hoisted(() => vi.fn());
const fetchValidationPacksMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/claims/services/claims.service", () => ({
  fetchPricelistValidationConfig: fetchPricelistValidationConfigMock,
  updatePricelistValidationConfig: updatePricelistValidationConfigMock,
  fetchValidationPacks: fetchValidationPacksMock,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const PRICELIST = {
  uuid: "pl-1",
  name: "MASM VIP",
  is_active: true,
  currency_code: "MWK",
};

const VIP_PACK = {
  id: 2,
  public_id: "pack-vip",
  code: "MASM_VIP_2026",
  name: "MASM VIP 2026",
  country_code: "MW",
  payer_code: "MASM",
  scheme_code: "VIP",
  description: "",
  applies_automatically: false,
  is_active: true,
};

afterEach(() => {
  cleanup();
});

describe("PricelistDetailSummaryTab advisor pack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchValidationPacksMock.mockResolvedValue([VIP_PACK]);
    fetchPricelistValidationConfigMock.mockResolvedValue({
      pricelist_uuid: PRICELIST.uuid,
      selected_pack_codes: [],
      selected_packs: [],
    });
    updatePricelistValidationConfigMock.mockResolvedValue({
      pricelist_uuid: PRICELIST.uuid,
      selected_pack_codes: [VIP_PACK.code],
      selected_packs: [VIP_PACK],
    });
  });

  it("assigns and clears an advisor pack from the summary tab", async () => {
    render(<PricelistDetailSummaryTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(fetchPricelistValidationConfigMock).toHaveBeenCalledWith(PRICELIST.uuid);
    });
    expect(screen.getByTestId("pricelist-advisor-pack-empty")).toHaveTextContent(
      "No advisor pack. Only global claim-quality checks will run.",
    );

    fireEvent.click(screen.getByTestId("pricelist-advisor-pack-select"));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /MASM VIP 2026/ })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: /MASM VIP 2026/ }));

    await waitFor(() => {
      expect(updatePricelistValidationConfigMock).toHaveBeenCalledWith(
        PRICELIST.uuid,
        ["MASM_VIP_2026"],
      );
    });
    expect(screen.getByTestId("pricelist-advisor-pack-assigned")).toHaveTextContent(
      "MASM VIP 2026",
    );

    updatePricelistValidationConfigMock.mockResolvedValueOnce({
      pricelist_uuid: PRICELIST.uuid,
      selected_pack_codes: [],
      selected_packs: [],
    });
    fireEvent.click(screen.getByTestId("pricelist-advisor-pack-select"));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "No advisor pack" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "No advisor pack" }));

    await waitFor(() => {
      expect(updatePricelistValidationConfigMock).toHaveBeenCalledWith(
        PRICELIST.uuid,
        [],
      );
    });
    expect(screen.getByTestId("pricelist-advisor-pack-empty")).toBeInTheDocument();
  });
});
