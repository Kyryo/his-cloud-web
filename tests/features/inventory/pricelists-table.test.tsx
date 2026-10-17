import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PricelistsTable } from "@/features/inventory/components/tables/pricelists-table";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

afterEach(() => {
  cleanup();
});

describe("PricelistsTable", () => {
  it("shows created at and created by with a small avatar", () => {
    render(
      <PricelistsTable
        pricelists={[
          {
            uuid: "pl-1",
            name: "Cash",
            is_active: true,
            currency_code: "MWK",
            created_at: "2026-10-01T09:30:00Z",
            created_by_name: "Grace Admin",
          },
          {
            uuid: "pl-2",
            name: "Legacy",
            is_active: false,
            currency_code: "MWK",
            created_at: null,
            created_by_name: null,
          },
        ]}
      />,
    );

    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent);
    expect(headers).toEqual([
      "Pricelist",
      "Currency",
      "Status",
      "Created at",
      "Created by",
    ]);

    const [cashRow, legacyRow] = screen.getAllByRole("row").slice(1);
    expect(cashRow).toHaveTextContent(formatDisplayDateTime("2026-10-01T09:30:00Z"));
    expect(within(cashRow!).getByText("Grace Admin")).toBeInTheDocument();
    const creatorCell = within(cashRow!).getByText("Grace Admin").parentElement;
    expect(creatorCell?.firstElementChild?.className).toContain("size-5");
    expect(legacyRow).toHaveTextContent("Unknown");
    expect(legacyRow).toHaveTextContent("—");
  });
});
