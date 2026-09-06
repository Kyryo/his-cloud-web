import { describe, expect, it } from "vitest";

import { PRODUCT_LIST_QUERY_KEYS } from "@/app/api/inventory/products/route";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";

describe("inventory products list query forwarding", () => {
  it("allowlists clinical classification filters used by OPD order tabs", () => {
    expect(PRODUCT_LIST_QUERY_KEYS).toEqual(
      expect.arrayContaining([
        "is_lab_test",
        "is_radiology",
        "is_procedure",
        "is_sundry",
        "procedure_context",
      ]),
    );
  });

  it("forwards is_lab_test so Lab tab does not list unclassified services", () => {
    const request = new Request(
      "http://localhost/api/inventory/products?product_type=service&is_lab_test=true&sale_ok=true&active=true&page=1&page_size=20",
    );

    const query = buildForwardedQuery(request, PRODUCT_LIST_QUERY_KEYS, {
      active: "true",
    });
    const params = new URLSearchParams(query.replace(/^\?/, ""));

    expect(params.get("is_lab_test")).toBe("true");
    expect(params.get("product_type")).toBe("service");
    expect(params.get("sale_ok")).toBe("true");
    expect(params.get("active")).toBe("true");
  });

  it("forwards procedure_context so OPD excludes dental-only procedures", () => {
    const request = new Request(
      "http://localhost/api/inventory/products?is_procedure=true&procedure_context=opd",
    );

    const query = buildForwardedQuery(request, PRODUCT_LIST_QUERY_KEYS);
    const params = new URLSearchParams(query.replace(/^\?/, ""));

    expect(params.get("is_procedure")).toBe("true");
    expect(params.get("procedure_context")).toBe("opd");
  });
});
