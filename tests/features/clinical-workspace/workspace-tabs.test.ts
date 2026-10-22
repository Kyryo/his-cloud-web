import { describe, expect, it } from "vitest";

import { DENTAL_WORKSPACE_ROUTING } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { OPD_WORKSPACE_ROUTING } from "@/features/clinical-opd/constants/opd-workspace-routing";
import {
  opdEncounterLandingHref,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";
import {
  getDefaultWorkspaceTab,
  getVisibleWorkspaceMenuSections,
  getVisibleWorkspaceTabs,
  workspaceLandingHref,
  workspaceTabFromPathname,
  workspaceTabHref,
} from "@/features/clinical-workspace/utils/workspace-tabs";

const DENTIST_CAPABILITIES = [
  "view_activity_tab",
  "record_chief_complaint",
  "view_physical_examination_tab",
  "view_dental_chart_tab",
  "view_treatment_plan_tab",
  "view_dental_history_tab",
  "view_orders_tab",
  "record_clinical_note",
  "perform_dental_procedure",
  "view_medications_tab",
  "view_diagnoses_tab",
];

describe("workspace tab routing", () => {
  it("keeps OPD hrefs and parsing unchanged", () => {
    expect(opdEncounterTabHref("v1", "e1", "overview")).toBe(
      "/clinical/opd/v1/e1/chart",
    );
    expect(opdEncounterTabHref("v1", "e1", "complaint")).toBe(
      "/clinical/opd/v1/e1/complaint",
    );
    expect(opdEncounterTabFromPathname("/clinical/opd/v1/e1/orders", "v1", "e1")).toBe(
      "orders",
    );
    expect(opdEncounterTabFromPathname("/clinical/opd/v1/e1", "v1", "e1")).toBeNull();
    expect(
      opdEncounterLandingHref("v1", "e1", ["record_chief_complaint"], "physician"),
    ).toBe("/clinical/opd/v1/e1/complaint");
  });

  it("builds dental hrefs under /clinical/dental", () => {
    expect(
      workspaceTabHref(DENTAL_WORKSPACE_ROUTING, "v1", "e1", "dental-chart"),
    ).toBe("/clinical/dental/v1/e1/dental-chart");
    expect(
      workspaceTabFromPathname(
        DENTAL_WORKSPACE_ROUTING,
        "/clinical/dental/v1/e1/treatment-plan",
        "v1",
        "e1",
      ),
    ).toBe("treatment-plan");
  });

  it("does not parse an OPD path as a dental tab", () => {
    expect(
      workspaceTabFromPathname(
        DENTAL_WORKSPACE_ROUTING,
        "/clinical/opd/v1/e1/orders",
        "v1",
        "e1",
      ),
    ).toBeNull();
  });

  it("shows the chair-side consult tabs and keeps records in the menu", () => {
    const tabs = getVisibleWorkspaceTabs(DENTAL_WORKSPACE_ROUTING, DENTIST_CAPABILITIES);
    const menu = getVisibleWorkspaceMenuSections(
      DENTAL_WORKSPACE_ROUTING,
      DENTIST_CAPABILITIES,
    ).map((section) => section.id);

    expect(tabs.map((tab) => tab.label)).toEqual([
      "Activity",
      "Complaints & HPI",
      "Notes",
      "Orders",
      "Treatment",
      "Medications",
    ]);
    expect(menu).toEqual(
      expect.arrayContaining([
        "physical-examination",
        "dental-chart",
        "treatment-plan",
        "diagnoses",
        "dental-history",
        "overview",
      ]),
    );
  });

  it("routes the treatment and notes tabs with the consult layout", () => {
    expect(workspaceTabHref(DENTAL_WORKSPACE_ROUTING, "v1", "e1", "treatment")).toBe(
      "/clinical/dental/v1/e1/treatment",
    );
    expect(
      workspaceTabFromPathname(
        DENTAL_WORKSPACE_ROUTING,
        "/clinical/dental/v1/e1/treatment",
        "v1",
        "e1",
      ),
    ).toBe("treatment");
    expect(DENTAL_WORKSPACE_ROUTING.consultLayoutTabIds.has("treatment")).toBe(true);
    expect(DENTAL_WORKSPACE_ROUTING.consultLayoutTabIds.has("notes")).toBe(true);
  });

  it("lands dentists on activity, then treatment, and falls back to the summary", () => {
    expect(
      getDefaultWorkspaceTab(
        DENTAL_WORKSPACE_ROUTING,
        ["perform_dental_procedure"],
        "dentist",
      ),
    ).toBe("treatment");
    expect(
      workspaceLandingHref(DENTAL_WORKSPACE_ROUTING, "v1", "e1", DENTIST_CAPABILITIES, "dentist"),
    ).toBe("/clinical/dental/v1/e1/activity");
    expect(getDefaultWorkspaceTab(DENTAL_WORKSPACE_ROUTING, [], "dentist")).toBe(
      "overview",
    );
  });

  it("hides dental tabs from OPD", () => {
    const ids = OPD_WORKSPACE_ROUTING.tabs.map((tab) => tab.id);
    expect(ids).not.toContain("dental-chart");
    expect(ids).not.toContain("treatment-plan");
  });
});
