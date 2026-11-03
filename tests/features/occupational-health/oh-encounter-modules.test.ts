import { describe, expect, it } from "vitest";

import { OH_ENCOUNTER_MODULES } from "@/features/occupational-health/lib/oh-encounter-modules";

describe("OH_ENCOUNTER_MODULES", () => {
  it("places Occupational Health Certificate between Medical Examinations and IOD", () => {
    const ids = OH_ENCOUNTER_MODULES.map((module) => module.id);
    expect(ids.indexOf("medical-examinations")).toBeLessThan(ids.indexOf("certificate"));
    expect(ids.indexOf("certificate")).toBeLessThan(ids.indexOf("iod"));
    expect(
      OH_ENCOUNTER_MODULES.find((module) => module.id === "certificate")?.label,
    ).toBe("Occupational Health Certificate");
  });
});
