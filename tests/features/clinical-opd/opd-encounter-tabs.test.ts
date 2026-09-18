import { describe, expect, it } from "vitest";

import {
  getDefaultOpdEncounterTab,
  getVisibleOpdEncounterTabGroups,
  getVisibleOpdEncounterTabs,
  isOpdEncounterLocked,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

describe("opd-encounter-tabs", () => {
  it("builds tab hrefs", () => {
    expect(opdEncounterTabHref("visit-1", "enc-1")).toBe(
      "/clinical/opd/visit-1/enc-1",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "overview")).toBe(
      "/clinical/opd/visit-1/enc-1",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "activity")).toBe(
      "/clinical/opd/visit-1/enc-1/activity",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "vital-signs")).toBe(
      "/clinical/opd/visit-1/enc-1/vital-signs",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "client")).toBe(
      "/clinical/opd/visit-1/enc-1/client",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "diagnoses")).toBe(
      "/clinical/opd/visit-1/enc-1/diagnoses",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "complaint")).toBe(
      "/clinical/opd/visit-1/enc-1/complaint",
    );
    expect(opdEncounterTabHref("visit-1", "enc-1", "nursing")).toBe(
      "/clinical/opd/visit-1/enc-1/nursing",
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
        "/clinical/opd/visit-1/enc-1/vital-signs",
        "visit-1",
        "enc-1",
      ),
    ).toBe("vital-signs");
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1/activity",
        "visit-1",
        "enc-1",
      ),
    ).toBe("activity");
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1/client",
        "visit-1",
        "enc-1",
      ),
    ).toBe("client");
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1",
        "visit-1",
        "enc-1",
      ),
    ).toBe("overview");
  });

  it("always includes overview and filters the rest by capability", () => {
    expect(
      getVisibleOpdEncounterTabs(["view_vital_signs_tab"]).map((tab) => tab.id),
    ).toEqual(["overview", "vital-signs"]);
    expect(
      getVisibleOpdEncounterTabs([
        "view_activity_tab",
        "view_physical_examination_tab",
        "view_diagnoses_tab",
        "view_medications_tab",
        "view_client_tab",
      ]).map((tab) => tab.id),
    ).toEqual([
      "overview",
      "physical-examination",
      "diagnoses",
      "medications",
      "activity",
      "client",
    ]);
  });

  it("groups visible tabs for the left nav", () => {
    const groups = getVisibleOpdEncounterTabGroups([
      "view_vital_signs_tab",
      "record_nursing_note",
      "record_allergy",
      "record_chief_complaint",
      "view_physical_examination_tab",
      "record_clinical_note",
      "view_diagnoses_tab",
      "manage_problem_list",
      "view_medications_tab",
      "view_orders_tab",
      "record_disposition",
      "view_activity_tab",
      "view_client_tab",
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      "overview",
      "nurse",
      "consult",
      "plan",
      "record",
    ]);
    expect(groups[1].tabs.map((tab) => tab.id)).toEqual([
      "vital-signs",
      "nursing",
      "allergies",
    ]);
  });

  it("locks writes after complete or cancel", () => {
    expect(isOpdEncounterLocked("completed")).toBe(true);
    expect(isOpdEncounterLocked("cancelled")).toBe(true);
    expect(isOpdEncounterLocked("waiting")).toBe(false);
  });

  it("lands on overview by default", () => {
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "physician",
      ),
    ).toBe("overview");
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "nurse",
      ),
    ).toBe("overview");
    expect(
      getDefaultOpdEncounterTab(
        ["view_activity_tab", "view_vital_signs_tab", "view_client_tab"],
        "physician",
      ),
    ).toBe("overview");
  });
});
