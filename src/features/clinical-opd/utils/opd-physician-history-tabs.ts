import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";

export type OpdHistorySectionId =
  | "complaint"
  | "exam"
  | "orders"
  | "diagnoses"
  | "medications";

/** Tabs that use the form / content / previous-visit layout. */
export const OPD_PHYSICIAN_HISTORY_TAB_IDS = new Set<OpdEncounterTabId>([
  "complaint",
  "physical-examination",
  "orders",
  "diagnoses",
  "medications",
]);

export function isOpdPhysicianHistoryTab(
  tabId: OpdEncounterTabId | null,
): tabId is OpdEncounterTabId {
  return tabId != null && OPD_PHYSICIAN_HISTORY_TAB_IDS.has(tabId);
}

export function opdHistorySectionForTab(
  tabId: OpdEncounterTabId | null,
): OpdHistorySectionId {
  switch (tabId) {
    case "physical-examination":
      return "exam";
    case "orders":
      return "orders";
    case "diagnoses":
      return "diagnoses";
    case "medications":
      return "medications";
    default:
      return "complaint";
  }
}
