import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  isLabOrderDetailTabSegment,
  labOrderDetailTabFromPathname,
  labOrderDetailTabHref,
} from "@/features/laboratory/utils/lab-order-detail-tabs";

describe("lab order detail tabs", () => {
  const orderUuid = "abc-123";

  it("builds overview and nested tab hrefs", () => {
    expect(labOrderDetailTabHref(orderUuid)).toBe(
      ROUTES.labOrderDetail(orderUuid),
    );
    expect(labOrderDetailTabHref(orderUuid, "overview")).toBe(
      ROUTES.labOrderDetail(orderUuid),
    );
    expect(labOrderDetailTabHref(orderUuid, "results")).toBe(
      `/lab-orders/${orderUuid}/results`,
    );
  });

  it("resolves the active tab from pathname", () => {
    expect(
      labOrderDetailTabFromPathname(`/lab-orders/${orderUuid}`, orderUuid),
    ).toBe("overview");
    expect(
      labOrderDetailTabFromPathname(
        `/lab-orders/${orderUuid}/specimens`,
        orderUuid,
      ),
    ).toBe("specimens");
    expect(
      labOrderDetailTabFromPathname(`/lab-orders/${orderUuid}/nope`, orderUuid),
    ).toBe("overview");
  });

  it("validates known tab segments", () => {
    expect(isLabOrderDetailTabSegment(undefined)).toBe(true);
    expect(isLabOrderDetailTabSegment("items")).toBe(true);
    expect(isLabOrderDetailTabSegment("unknown")).toBe(false);
  });
});
