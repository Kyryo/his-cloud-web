import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";

export function buildInventoryQuery(
  filters: InventoryListFilters = {},
  extraKeys: Array<keyof InventoryListFilters> = [],
): string {
  const params = new URLSearchParams();

  const setIfPresent = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    params.set(key, String(value));
  };

  setIfPresent("page", filters.page);
  setIfPresent("page_size", filters.pageSize);
  setIfPresent("search", filters.search?.trim());
  setIfPresent("ordering", filters.ordering);
  setIfPresent("tenant", filters.tenant);
  setIfPresent("location", filters.location);
  setIfPresent("location_uuid", filters.location_uuid);
  setIfPresent("clinic", filters.clinic);
  setIfPresent("clinic_uuid", filters.clinic_uuid);
  setIfPresent("odoo_product_id", filters.odoo_product_id);
  setIfPresent("batch", filters.batch);
  setIfPresent("batch_uuid", filters.batch_uuid);
  setIfPresent("is_active", filters.is_active);
  setIfPresent("has_batch", filters.has_batch);
  setIfPresent("has_expiry_date", filters.has_expiry_date);
  setIfPresent("status", filters.status);
  setIfPresent("receiving_location", filters.receiving_location);
  setIfPresent("source_location", filters.source_location);
  setIfPresent("source_location_uuid", filters.source_location_uuid);
  setIfPresent("destination_location", filters.destination_location);
  setIfPresent("destination_location_uuid", filters.destination_location_uuid);
  setIfPresent("from_location_uuid", filters.from_location_uuid);
  setIfPresent("to_location_uuid", filters.to_location_uuid);
  setIfPresent("adjustment_type", filters.adjustment_type);
  setIfPresent("movement_type", filters.movement_type);
  setIfPresent("document_type", filters.document_type);
  setIfPresent("workflow", filters.workflow);

  for (const key of extraKeys) {
    setIfPresent(key, filters[key]);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
