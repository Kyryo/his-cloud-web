/** User-facing copy for ERP sync (`has_synced_to_odoo` on the API). */
export const ERP_SYNC_LABELS = {
  synced: "Synced to ERP",
  notSynced: "Not synced to ERP",
  filterLabel: "ERP sync",
  filterSynced: "Synced to ERP",
  filterNotSynced: "Not synced to ERP",
  fieldLabel: "ERP sync",
} as const;

export function formatErpSyncStatus(hasSyncedToErp: boolean): string {
  return hasSyncedToErp ? ERP_SYNC_LABELS.synced : ERP_SYNC_LABELS.notSynced;
}
