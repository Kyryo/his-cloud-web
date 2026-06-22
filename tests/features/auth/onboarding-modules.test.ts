import { describe, expect, it } from "vitest";

import {
  groupNamesToModuleIds,
  moduleIdsToGroupNames,
} from "@/features/auth/constants/onboarding-modules";

describe("onboarding module helpers", () => {
  it("maps module ids to backend group names", () => {
    expect(moduleIdsToGroupNames(["registration", "billing"])).toEqual([
      "Registration",
      "Billing",
    ]);
  });

  it("maps backend group names to module ids", () => {
    expect(groupNamesToModuleIds(["Registration", "Inventory"])).toEqual([
      "registration",
      "inventory",
    ]);
  });
});
