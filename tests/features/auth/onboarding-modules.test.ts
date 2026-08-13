import { describe, expect, it } from "vitest";

import {
  DEFAULT_SIGNUP_MODULE_IDS,
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

  it("maps default signup modules to backend groups", () => {
    expect(moduleIdsToGroupNames([...DEFAULT_SIGNUP_MODULE_IDS])).toEqual([
      "Registration",
      "Billing",
      "Inventory",
      "Claims",
    ]);
  });
});
