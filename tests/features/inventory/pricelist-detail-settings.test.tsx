import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PricelistDetailSettingsTab } from "@/features/inventory/components/detail/PricelistDetailSettingsTab";

const fetchSettingsMock = vi.hoisted(() => vi.fn());
const startSyncMock = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => vi.fn());
const useUserMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogPricelistSettings: fetchSettingsMock,
  startCatalogMasmCorePriceSync: startSyncMock,
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: toastMock }),
}));

vi.mock("@/providers/user-provider", () => ({
  useUser: () => useUserMock(),
}));

vi.mock("@/features/inventory/components/detail/PricelistMasmSyncJobPanel", () => ({
  PricelistMasmSyncJobPanel: () => <div data-testid="pricelist-masm-sync-job-panel" />,
}));

const PRICELIST = {
  uuid: "pl-1",
  name: "MASM VIP",
  is_active: true,
  currency_code: "MWK",
};

const SETTINGS = {
  pricelist_uuid: PRICELIST.uuid,
  schemes: [
    {
      uuid: "scheme-1",
      name: "VIP",
      code: "VIP",
      company_name: "MASM",
      is_active: true,
    },
  ],
  core_provider_id: 154,
};

afterEach(() => {
  cleanup();
});

describe("PricelistDetailSettingsTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSettingsMock.mockResolvedValue(SETTINGS);
    useUserMock.mockReturnValue({ userData: { is_admin: true } });
  });

  it("loads settings for any viewer and enables sync for admins with provider id", async () => {
    render(<PricelistDetailSettingsTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(fetchSettingsMock).toHaveBeenCalledWith(PRICELIST.uuid);
    });
    expect(screen.getByTestId("pricelist-settings-tab")).toHaveTextContent("VIP");
    expect(screen.getByTestId("pricelist-masm-sync-button")).not.toBeDisabled();
    expect(screen.queryByTestId("pricelist-masm-sync-hint")).not.toBeInTheDocument();
  });

  it("shows a disabled sync button with permission hint for non-admins", async () => {
    useUserMock.mockReturnValue({ userData: { is_admin: false } });

    render(<PricelistDetailSettingsTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("pricelist-masm-sync-button")).toBeDisabled();
    });
    expect(screen.getByTestId("pricelist-masm-sync-hint")).toHaveTextContent(
      "You don't have permissions to run a sync.",
    );
    expect(startSyncMock).not.toHaveBeenCalled();
  });

  it("disables sync when no resolvable service provider code", async () => {
    fetchSettingsMock.mockResolvedValue({
      ...SETTINGS,
      core_provider_id: null,
    });

    render(<PricelistDetailSettingsTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("pricelist-masm-sync-button")).toBeDisabled();
    });
    expect(screen.getByTestId("pricelist-masm-sync-hint")).toHaveTextContent(
      "Add a service provider code on a linked practitioner mapping.",
    );
  });

  it("does not show practitioner mapping", async () => {
    render(<PricelistDetailSettingsTab pricelist={PRICELIST} isActive />);

    await waitFor(() => {
      expect(screen.getByTestId("pricelist-settings-tab")).toBeInTheDocument();
    });
    expect(screen.queryByText("Practitioner mapping")).not.toBeInTheDocument();
  });
});
