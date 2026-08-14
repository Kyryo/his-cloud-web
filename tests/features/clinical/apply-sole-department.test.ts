import { describe, expect, it } from "vitest";

import { resolveDefaultDepartmentUuid } from "@/features/clinical/utils/apply-sole-department";

describe("resolveDefaultDepartmentUuid", () => {
  it("returns the only department uuid", () => {
    expect(resolveDefaultDepartmentUuid([{ uuid: "dept-1" }])).toBe("dept-1");
  });

  it("returns empty when there are multiple departments", () => {
    expect(
      resolveDefaultDepartmentUuid([{ uuid: "dept-1" }, { uuid: "dept-2" }]),
    ).toBe("");
  });

  it("returns empty when there are no departments", () => {
    expect(resolveDefaultDepartmentUuid([])).toBe("");
  });
});
