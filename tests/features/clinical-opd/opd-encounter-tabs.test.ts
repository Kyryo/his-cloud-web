import { describe, expect, it } from "vitest";

import {
  getDefaultOpdEncounterTab,
  getVisibleOpdEncounterMenuSections,
  getVisibleOpdEncounterTabs,
  isOpdEncounterLocked,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";

describe("opd-encounter-tabs", () => {
  it("builds tab hrefs", () => {
    expect(opdEncounterTabHref("visit-1", "enc-1", "overview")).toBe(
      "/clinical/opd/visit-1/enc-1/chart",
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
        "/clinical/opd/visit-1/enc-1/chart",
        "visit-1",
        "enc-1",
      ),
    ).toBe("overview");
    // The bare encounter URL is a redirect, not a section of its own.
    expect(
      opdEncounterTabFromPathname(
        "/clinical/opd/visit-1/enc-1",
        "visit-1",
        "enc-1",
      ),
    ).toBeNull();
  });

  it("keeps the consult flow in the tab bar and moves the rest to More", () => {
    expect(
      getVisibleOpdEncounterTabs(["view_vital_signs_tab"]).map((tab) => tab.id),
    ).toEqual(["vital-signs"]);
    expect(
      getVisibleOpdEncounterMenuSections(["view_vital_signs_tab"]).map(
        (tab) => tab.id,
      ),
    ).toEqual(["overview"]);
    expect(
      getVisibleOpdEncounterTabs([
        "view_activity_tab",
        "view_vital_signs_tab",
        "view_physical_examination_tab",
        "view_diagnoses_tab",
        "view_medications_tab",
        "view_nursing_notes_tab",
        "view_client_tab",
      ]).map((tab) => tab.id),
    ).toEqual([
      "physical-examination",
      "diagnoses",
      "medications",
      "vital-signs",
      "nursing",
    ]);
    expect(
      getVisibleOpdEncounterTabs([
        "record_chief_complaint",
        "view_physical_examination_tab",
        "view_orders_tab",
        "view_diagnoses_tab",
        "view_medications_tab",
      ]).map((tab) => tab.id),
    ).toEqual([
      "complaint",
      "physical-examination",
      "orders",
      "diagnoses",
      "medications",
    ]);
  });

  it("locks writes after complete or cancel", () => {
    expect(isOpdEncounterLocked("completed")).toBe(true);
    expect(isOpdEncounterLocked("cancelled")).toBe(true);
    expect(isOpdEncounterLocked("waiting")).toBe(false);
  });

  it("lands physicians on chief complaint and nurses on vitals", () => {
    expect(
      getDefaultOpdEncounterTab(
        ["record_chief_complaint", "record_hpi", "view_vital_signs_tab"],
        "physician",
      ),
    ).toBe("complaint");
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "nurse",
      ),
    ).toBe("vital-signs");
    expect(
      getDefaultOpdEncounterTab(
        ["view_vital_signs_tab", "view_diagnoses_tab"],
        "physician",
      ),
    ).toBe("diagnoses");
  });
});
