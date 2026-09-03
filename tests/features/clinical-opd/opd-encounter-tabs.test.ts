import { describe, expect, it } from "vitest";

import {
  getDefaultOpdEncounterTab,
  getVisibleOpdEncounterTabs,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

describe("opd-encounter-tabs", () => {
  it("builds tab hrefs", () => {
    expect(opdEncounterTabHref("visit-1", "enc-1")).toBe(
      "/clinical/opd/visit-1/enc-1",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "diagnoses")).toBe(
      "/clinical/opd/visit-1/enc-1/diagnoses",
    );
  });

  it("resolves active tab from pathname", () => {
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1/medications",
        "visit-1",
        "enc-1",
      ),
    ).toBe("medications");
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1/activity",
        "visit-1",
        "enc-1",
      ),
    ).toBe("activity");
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1",
        "visit-1",
        "enc-1",
      ),
    ).toBe("vital-signs");
  });

  it("filters visible tabs by workspace tab capabilities", () => {
    expect(
      getVisibleOpdEncounterTabs(["view_vital_signs_tab"]).map((tab) => tab.id),
    ).toEqual(["vital-signs"]);
    expect(
      getVisibleOpdEncounterTabs([
        "view_physical_examination_tab",
        "view_diagnoses_tab",
        "view_medications_tab",
        "view_activity_tab",
      ]).map((tab) => tab.id),
    ).toEqual([
      "physical-examination",
      "diagnoses",
      "medications",
      "activity",
    ]);
  });

  it("picks role-aware default tab", () => {
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "physician",
      ),
    ).toBe("diagnoses");
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "nurse",
      ),
    ).toBe("vital-signs");
  });
});
