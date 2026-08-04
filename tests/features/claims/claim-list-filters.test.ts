import { describe, expect, it } from "vitest";

import {
  buildClaimListFilters,
  countActiveClaimFilters,
  DEFAULT_CLAIM_LIST_FILTERS,
} from "@/features/claims/utils/claim-list-filters";
import { isClaimableInvoice } from "@/features/claims/utils/is-claimable-invoice";
import type { Invoice } from "@/features/invoices/types/invoice.types";

describe("claim-list-filters", () => {
  it("builds membership and status query filters", () => {
    expect(
      buildClaimListFilters({
        membershipNumber: "  MEM-100  ",
        page: 2,
        pageSize: 20,
        filters: { status: "draft" },
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      membershipNumber: "MEM-100",
      status: "draft",
    });
  });

  it("omits empty membership and all status", () => {
    expect(
      buildClaimListFilters({
        membershipNumber: "   ",
        page: 1,
        pageSize: 20,
        filters: DEFAULT_CLAIM_LIST_FILTERS,
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
    });
  });

  it("counts active status filters", () => {
    expect(countActiveClaimFilters(DEFAULT_CLAIM_LIST_FILTERS)).toBe(0);
    expect(countActiveClaimFilters({ status: "submitted" })).toBe(1);
  });
});

describe("isClaimableInvoice", () => {
  const baseInvoice = {
    id: 1,
    name: "INV/001",
    state: "posted",
    customer_id: 10,
    customer_uuid: "cust-1",
    customer_name: "Clinic Patient",
    amount_untaxed: "0",
    amount_tax: "0",
    amount_total: "100",
    invoice_date: "2026-07-01",
  } satisfies Partial<Invoice> as Invoice;

  it("accepts posted invoices marked can_initiate_claim", () => {
    expect(
      isClaimableInvoice({
        ...baseInvoice,
        can_initiate_claim: true,
      }),
    ).toBe(true);
  });

  it("accepts posted insurance invoices with a visit as fallback", () => {
    expect(
      isClaimableInvoice({
        ...baseInvoice,
        insurance_scheme_id: 3,
        visit_uuid: "visit-1",
      }),
    ).toBe(true);
  });

  it("rejects draft invoices", () => {
    expect(
      isClaimableInvoice({
        ...baseInvoice,
        state: "draft",
        can_initiate_claim: true,
      }),
    ).toBe(false);
  });

  it("rejects posted invoices without claim readiness", () => {
    expect(isClaimableInvoice(baseInvoice)).toBe(false);
  });
});
