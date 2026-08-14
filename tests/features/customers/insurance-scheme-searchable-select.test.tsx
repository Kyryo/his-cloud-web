import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InsuranceSchemeSearchableSelect } from "@/features/customers/components/InsuranceSchemeSearchableSelect";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";

function makeScheme(
  overrides: Partial<InsuranceScheme> &
    Pick<InsuranceScheme, "id" | "name" | "insurance_company" | "insurance_company_name">,
): InsuranceScheme {
  return {
    uuid: `scheme-${overrides.id}`,
    tenant: 1,
    code: `CODE-${overrides.id}`,
    description: "",
    pricelist_id: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    created_by: null,
    ...overrides,
  };
}

const schemes: InsuranceScheme[] = [
  makeScheme({
    id: 1,
    name: "Gold",
    insurance_company: 10,
    insurance_company_name: "MASM",
  }),
  makeScheme({
    id: 2,
    name: "Silver",
    insurance_company: 10,
    insurance_company_name: "MASM",
  }),
  makeScheme({
    id: 3,
    name: "Executive",
    insurance_company: 20,
    insurance_company_name: "CIC",
  }),
  makeScheme({
    id: 4,
    name: "Standard",
    insurance_company: 30,
    insurance_company_name: "Liberty",
  }),
  makeScheme({
    id: 5,
    name: "Plus",
    insurance_company: 40,
    insurance_company_name: "NICO",
  }),
  makeScheme({
    id: 6,
    name: "Core",
    insurance_company: 50,
    insurance_company_name: "Old Mutual",
  }),
];

afterEach(() => {
  cleanup();
});

describe("InsuranceSchemeSearchableSelect", () => {
  it("filters schemes when a payer badge is clicked", () => {
    render(
      <InsuranceSchemeSearchableSelect
        schemes={schemes}
        value={null}
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const badges = screen.getAllByRole("button");
    expect(badges[0]).toHaveTextContent("View all");
    expect(badges[0]).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "MASM" }));

    expect(screen.getByRole("option", { name: "MASM-Gold" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "MASM-Silver" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "CIC-Executive" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View all" }));

    expect(screen.getByRole("option", { name: "CIC-Executive" })).toBeInTheDocument();
  });

  it("expands overflow payers from the more payers badge", () => {
    render(
      <InsuranceSchemeSearchableSelect
        schemes={schemes}
        value={null}
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.queryByRole("button", { name: "Old Mutual" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1 more payer" }));

    expect(screen.getByRole("button", { name: "Old Mutual" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CIC" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "1 more payer" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View all" }));

    expect(screen.queryByRole("button", { name: "Old Mutual" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1 more payer" })).toBeInTheDocument();
  });
});
