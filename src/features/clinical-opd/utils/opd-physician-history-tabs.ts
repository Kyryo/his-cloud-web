import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";

/** Tabs that show the previous-visit history side panel. */
export const OPD_PHYSICIAN_HISTORY_TAB_IDS = new Set<OpdEncounterTabId>([
  "complaint",
  "physical-examination",
  "notes",
  "diagnoses",
  "problems",
  "medications",
  "orders",
  "disposition",
]);

export function isOpdPhysicianHistoryTab(tabId: OpdEncounterTabId): boolean {
  return OPD_PHYSICIAN_HISTORY_TAB_IDS.has(tabId);
}
