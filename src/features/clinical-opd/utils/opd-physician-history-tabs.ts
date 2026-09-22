import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";

export type OpdHistorySectionId =
  | "complaint"
  | "exam"
  | "orders"
  | "investigations"
  | "diagnoses"
  | "medications"
  | "vitals"
  | "nursing";

/** Tabs that use the form / content / previous-visit layout. */
export const OPD_CONSULT_LAYOUT_TAB_IDS = new Set<OpdEncounterTabId>([
  "complaint",
  "physical-examination",
  "orders",
  "investigation-results",
  "diagnoses",
  "medications",
  "nursing",
  "vital-signs",
]);

/** @deprecated Prefer OPD_CONSULT_LAYOUT_TAB_IDS */
export const OPD_PHYSICIAN_HISTORY_TAB_IDS = OPD_CONSULT_LAYOUT_TAB_IDS;

export function isOpdPhysicianHistoryTab(
  tabId: OpdEncounterTabId | null,
): tabId is OpdEncounterTabId {
  return tabId != null && OPD_CONSULT_LAYOUT_TAB_IDS.has(tabId);
}

export function opdHistorySectionForTab(
  tabId: OpdEncounterTabId | null,
): OpdHistorySectionId {
  switch (tabId) {
    case "physical-examination":
      return "exam";
    case "orders":
      return "orders";
    case "investigation-results":
      return "investigations";
    case "diagnoses":
      return "diagnoses";
    case "medications":
      return "medications";
    case "vital-signs":
      return "vitals";
    case "nursing":
      return "nursing";
    default:
      return "complaint";
  }
}
