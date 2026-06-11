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
  setIfPresent("odoo_product_id", filters.odoo_product_id);
  setIfPresent("batch", filters.batch);
  setIfPresent("is_active", filters.is_active);
  setIfPresent("status", filters.status);
  setIfPresent("receiving_location", filters.receiving_location);
  setIfPresent("source_location", filters.source_location);
  setIfPresent("destination_location", filters.destination_location);
  setIfPresent("adjustment_type", filters.adjustment_type);
  setIfPresent("movement_type", filters.movement_type);
  setIfPresent("clinic", filters.clinic);
  setIfPresent("document_type", filters.document_type);
  setIfPresent("workflow", filters.workflow);

  for (const key of extraKeys) {
    setIfPresent(key, filters[key]);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
