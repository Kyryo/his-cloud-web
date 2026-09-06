import type { OpdEncounterTabId } from "@/features/clinical-opd/utils/opd-encounter-tabs";

/** Tabs that show vitals strip + previous-visit history side panel. */
export const OPD_PHYSICIAN_HISTORY_TAB_IDS = new Set<OpdEncounterTabId>([
  "physical-examination",
  "orders",
  "diagnoses",
  "medications",
]);

export function isOpdPhysicianHistoryTab(tabId: OpdEncounterTabId): boolean {
  return OPD_PHYSICIAN_HISTORY_TAB_IDS.has(tabId);
}
