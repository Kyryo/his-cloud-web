import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InventoryListFilters,
  InventoryLocationOption,
  InventoryMovement,
  InventoryMovementListResponse,
  InventoryProduct,
  InventoryStock,
  InventoryStockListResponse,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

export async function fetchInventoryStock(
  filters: InventoryListFilters = {},
): Promise<InventoryStockListResponse> {
  return bffRequest<InventoryStockListResponse>(
    `${BFF_INVENTORY_ROUTES.stock.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInventoryStockItem(uuid: string): Promise<InventoryStock> {
  return bffRequest<InventoryStock>(BFF_INVENTORY_ROUTES.stock.detail(uuid));
}

export async function fetchInventoryMovements(
  filters: InventoryListFilters = {},
): Promise<InventoryMovementListResponse> {
  return bffRequest<InventoryMovementListResponse>(
    `${BFF_INVENTORY_ROUTES.movements.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInventoryMovement(uuid: string): Promise<InventoryMovement> {
  return bffRequest<InventoryMovement>(BFF_INVENTORY_ROUTES.movements.detail(uuid));
}

export async function searchInventoryProducts(options: {
  q?: string;
  active?: boolean;
  tenant?: number;
} = {}): Promise<InventoryProduct[]> {
  const params = new URLSearchParams();
  if (options.q?.trim()) {
    params.set("q", options.q.trim());
  }
  if (options.active !== undefined) {
    params.set("active", String(options.active));
  }
  if (options.tenant) {
    params.set("tenant", String(options.tenant));
  }
  const query = params.toString();
  const path = query
    ? `${BFF_INVENTORY_ROUTES.products.search}?${query}`
    : BFF_INVENTORY_ROUTES.products.search;
  return bffRequest<InventoryProduct[]>(path);
}

export async function fetchInventoryProduct(
  productId: number | string,
): Promise<InventoryProduct> {
  return bffRequest<InventoryProduct>(
    BFF_INVENTORY_ROUTES.products.detail(productId),
  );
}

export async function fetchInventoryLocations(
  clinicId?: number,
): Promise<PaginatedListResponse<InventoryLocationOption>> {
  const params = new URLSearchParams({ page_size: "200" });
  if (clinicId) {
    params.set("clinic", String(clinicId));
  }
  return bffRequest<PaginatedListResponse<InventoryLocationOption>>(
    `${BFF_INVENTORY_ROUTES.locations}?${params.toString()}`,
  );
}
