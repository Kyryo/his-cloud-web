import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PricelistCopyJobPanel } from "@/features/inventory/components/detail/PricelistCopyJobPanel";

const fetchCatalogPricelistCopyJobMock = vi.hoisted(() => vi.fn());
const fetchCatalogPricelistCopyJobItemsMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/catalog/services/catalog.service", () => ({
  fetchCatalogPricelistCopyJob: fetchCatalogPricelistCopyJobMock,
  fetchCatalogPricelistCopyJobItems: fetchCatalogPricelistCopyJobItemsMock,
}));

const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const TARGET_UUID = "22222222-2222-2222-2222-222222222222";
const JOB_UUID = "44444444-4444-4444-4444-444444444444";

describe("PricelistCopyJobPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchCatalogPricelistCopyJobMock.mockResolvedValue({
      uuid: JOB_UUID,
      status: "running",
      target_pricelist_uuid: TARGET_UUID,
      source_pricelist_uuid: "33333333-3333-3333-3333-333333333333",
      source_pricelist_name: "Cash",
      total_items: 2,
      succeeded_items: 1,
      failed_items: 0,
      failure_code: "",
      failure_message: "",
    });
    fetchCatalogPricelistCopyJobItemsMock.mockResolvedValue({
      results: [],
      pagination: { count: 0, next: null, previous: null },
    });
  });

  it("renders running copy progress", async () => {
    render(
      <PricelistCopyJobPanel
        targetPricelistUuid={TARGET_UUID}
        jobUuid={JOB_UUID}
      />,
    );

    await waitFor(() => {
      expect(fetchCatalogPricelistCopyJobMock).toHaveBeenCalled();
    });

    expect(screen.getByText("Copying products")).toBeInTheDocument();
    expect(screen.getByText("From Cash")).toBeInTheDocument();
    expect(screen.getByText("Succeeded: 1")).toBeInTheDocument();
  });

  it("shows failed items after a partially completed job", async () => {
    fetchCatalogPricelistCopyJobMock.mockResolvedValue({
      uuid: JOB_UUID,
      status: "partially_completed",
      target_pricelist_uuid: TARGET_UUID,
      source_pricelist_uuid: "33333333-3333-3333-3333-333333333333",
      source_pricelist_name: "Cash",
      total_items: 2,
      succeeded_items: 1,
      failed_items: 1,
      failure_code: "",
      failure_message: "",
    });

    fetchCatalogPricelistCopyJobItemsMock.mockResolvedValue({
      results: [
        {
          product_uuid: "55555555-5555-5555-5555-555555555555",
          product_name: "Inactive service",
          fixed_price: "100.0000",
          min_quantity: "0.0000",
          status: "failed",
          error_code: "product_inactive",
          error_message: "Product is no longer active.",
        },
      ],
      pagination: { count: 1, next: null, previous: null },
    });

    render(
      <PricelistCopyJobPanel
        targetPricelistUuid={TARGET_UUID}
        jobUuid={JOB_UUID}
        copyToastId="pricelist-copy-toast"
        onTerminal={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Partially completed")).toBeInTheDocument();
      expect(screen.getByText("Inactive service")).toBeInTheDocument();
      expect(screen.getByText("Product is no longer active.")).toBeInTheDocument();
    });

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pricelist-copy-toast",
        variant: "warning",
        title: "Copy partially completed",
      }),
    );
  });

  it("fires terminal callback only once", async () => {
    const onTerminal = vi.fn();
    fetchCatalogPricelistCopyJobMock.mockResolvedValue({
      uuid: JOB_UUID,
      status: "completed",
      target_pricelist_uuid: TARGET_UUID,
      source_pricelist_uuid: "33333333-3333-3333-3333-333333333333",
      source_pricelist_name: "Cash",
      total_items: 2,
      succeeded_items: 2,
      failed_items: 0,
      failure_code: "",
      failure_message: "",
    });

    render(
      <PricelistCopyJobPanel
        targetPricelistUuid={TARGET_UUID}
        jobUuid={JOB_UUID}
        copyToastId="pricelist-copy-toast"
        onTerminal={onTerminal}
        onDismiss={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(onTerminal).toHaveBeenCalledTimes(1);
    });

    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "pricelist-copy-toast",
        variant: "success",
        title: "Copy completed",
      }),
    );
  });
});
