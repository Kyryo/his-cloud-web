import {
  OPD_WORKSPACE_ROUTING,
  type OpdEncounterTabId,
} from "@/features/clinical-opd/constants/opd-workspace-routing";
import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  getDefaultWorkspaceTab,
  getVisibleWorkspaceMenuSections,
  getVisibleWorkspaceSections,
  getVisibleWorkspaceTabs,
  workspaceLandingHref,
  workspaceTabFromPathname,
  workspaceTabHref,
} from "@/features/clinical-workspace/utils/workspace-tabs";

export {
  OPD_ENCOUNTER_TABS,
  type OpdEncounterTab,
  type OpdEncounterTabId,
} from "@/features/clinical-opd/constants/opd-workspace-routing";

export type OpdEncounterTabGroupId = "nurse" | "consult" | "record";

export type OpdEncounterTabSurface = "tab" | "menu";

const CONSULT_TAB_IDS = new Set<OpdEncounterTabId>(
  OPD_WORKSPACE_ROUTING.tabs
    .filter((tab) => tab.group === "consult")
    .map((tab) => tab.id),
);

export function isOpdConsultTab(tabId: OpdEncounterTabId): boolean {
  return CONSULT_TAB_IDS.has(tabId);
}

export function opdEncounterLandingHref(
  visitUuid: string,
  encounterUuid: string,
  capabilities: string[],
  userRole?: string | null,
) {
  return workspaceLandingHref(
    OPD_WORKSPACE_ROUTING,
    visitUuid,
    encounterUuid,
    capabilities,
    userRole,
  );
}

export function opdEncounterTabHref(
  visitUuid: string,
  encounterUuid: string,
  tabId: OpdEncounterTabId,
): string {
  return workspaceTabHref(OPD_WORKSPACE_ROUTING, visitUuid, encounterUuid, tabId);
}

/**
 * Returns `null` for the bare encounter URL, which redirects to the role's
 * default tab rather than rendering a section of its own.
 */
export function opdEncounterTabFromPathname(
  pathname: string,
  visitUuid: string,
  encounterUuid: string,
): OpdEncounterTabId | null {
  return workspaceTabFromPathname(
    OPD_WORKSPACE_ROUTING,
    pathname,
    visitUuid,
    encounterUuid,
  );
}

/** Every section the user may open, including header-menu ones. */
export function getVisibleOpdEncounterSections(capabilities: string[]) {
  return getVisibleWorkspaceSections(OPD_WORKSPACE_ROUTING, capabilities);
}

/** Sections rendered in the tab bar. */
export function getVisibleOpdEncounterTabs(capabilities: string[]) {
  return getVisibleWorkspaceTabs(OPD_WORKSPACE_ROUTING, capabilities);
}

/** Sections rendered in the header overflow menu. */
export function getVisibleOpdEncounterMenuSections(capabilities: string[]) {
  return getVisibleWorkspaceMenuSections(OPD_WORKSPACE_ROUTING, capabilities);
}

export function getDefaultOpdEncounterTab(
  capabilities: string[],
  userRole?: string | null,
): OpdEncounterTabId {
  return getDefaultWorkspaceTab(OPD_WORKSPACE_ROUTING, capabilities, userRole);
}

export function hasClinicalCapability(
  capabilities: string[],
  capability: ClinicalCapabilityKey,
) {
  return capabilities.includes(capability);
}

export function isOpdEncounterLocked(status?: string | null) {
  return status === "completed" || status === "cancelled";
}
