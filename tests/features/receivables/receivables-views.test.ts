import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  parseReceivablesAging,
  parseReceivablesPage,
  parseReceivablesView,
  receivablesHref,
} from "@/features/receivables/utils/receivables-views";

describe("receivables views", () => {
  it("defaults to debtors and page 1", () => {
    expect(parseReceivablesView(null)).toBe("debtors");
    expect(parseReceivablesView("invoices")).toBe("invoices");
    expect(parseReceivablesPage("0")).toBe(1);
    expect(parseReceivablesPage("3")).toBe(3);
    expect(parseReceivablesAging("31-60")).toBe("31-60");
    expect(parseReceivablesAging("current")).toBeNull();
  });

  it("builds compact hrefs", () => {
    expect(receivablesHref()).toBe(ROUTES.receivables);
    expect(
      receivablesHref({
        view: "invoices",
        search: "Ada",
        page: 2,
        aging: "0-30",
      }),
    ).toBe(`${ROUTES.receivables}?view=invoices&q=Ada&page=2&aging=0-30`);
  });
});
