import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  moduleDisplayNames,
  navigation,
} from "@/features/app-shell/constants/navigation-config";

describe("OHS navigation", () => {
  it("renames the OH module group and items to OHS", () => {
    expect(moduleDisplayNames.OccupationalHealth).toBe("OHS");

    const ohItems = navigation.filter(
      (item) => item.moduleName === "OccupationalHealth",
    );
    expect(ohItems.map((item) => item.name)).toEqual([
      "OHS Queue",
      "Employees",
      "OHS Compliance",
      "OHS Surveillance",
    ]);
    expect(ohItems.map((item) => item.href)).toEqual([
      ROUTES.occupationalHealth,
      ROUTES.occupationalHealthEmployees,
      ROUTES.occupationalHealthCompliance,
      ROUTES.occupationalHealthSurveillance,
    ]);
  });
});
