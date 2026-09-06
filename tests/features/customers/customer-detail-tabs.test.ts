import { describe, expect, it } from "vitest";

import {
  CUSTOMER_DETAIL_TABS,
  customerDetailTabFromPathname,
  customerDetailTabHref,
  isCustomerDetailTabSegment,
} from "@/features/customers/utils/customer-detail-tabs";

const CUSTOMER_ID = "57136727-9e05-4ae3-9146-149106022595";

describe("customer detail tab routes", () => {
  it("builds summary as the customer detail root", () => {
    expect(customerDetailTabHref(CUSTOMER_ID)).toBe(`/customers/${CUSTOMER_ID}`);
    expect(customerDetailTabHref(CUSTOMER_ID, "summary")).toBe(
      `/customers/${CUSTOMER_ID}`,
    );
  });

  it("builds nested URLs for each tab segment", () => {
    expect(customerDetailTabHref(CUSTOMER_ID, "orders")).toBe(
      `/customers/${CUSTOMER_ID}/orders`,
    );
    expect(customerDetailTabHref(CUSTOMER_ID, "legal-guardians")).toBe(
      `/customers/${CUSTOMER_ID}/legal-guardians`,
    );
  });

  it("reads the active tab from the pathname", () => {
    expect(
      customerDetailTabFromPathname(`/customers/${CUSTOMER_ID}`, CUSTOMER_ID),
    ).toBe("summary");
    expect(
      customerDetailTabFromPathname(
        `/customers/${CUSTOMER_ID}/visits`,
        CUSTOMER_ID,
      ),
    ).toBe("visits");
    expect(
      customerDetailTabFromPathname(
        `/customers/${CUSTOMER_ID}/unknown`,
        CUSTOMER_ID,
      ),
    ).toBe("summary");
  });

  it("assigns an icon to every client tab", () => {
    expect(CUSTOMER_DETAIL_TABS.every((tab) => Boolean(tab.icon))).toBe(true);
  });

  it("accepts known tab segments and the empty summary segment", () => {
    expect(isCustomerDetailTabSegment(undefined)).toBe(true);
    expect(isCustomerDetailTabSegment("invoices")).toBe(true);
    expect(isCustomerDetailTabSegment("not-a-tab")).toBe(false);
  });
});
