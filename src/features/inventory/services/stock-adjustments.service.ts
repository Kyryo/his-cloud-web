import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InventoryListFilters,
  StockAdjustment,
  StockAdjustmentListResponse,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type StockAdjustmentLinePayload = {
  id?: number;
  product_id?: number;
  product_uuid?: string;
  batch?: number | null;
  quantity_delta?: string | number;
  new_unit_cost?: string | number | null;
  notes?: string | null;
};

export type StockAdjustmentPayload = {
  location: number;
  adjustment_type: string;
  reason?: string | null;
  notes?: string | null;
  lines?: StockAdjustmentLinePayload[];
  is_active?: boolean;
};

export type StockAdjustmentAction =
  | "submit"
  | "approve"
  | "reject"
  | "apply"
  | "cancel";

export async function fetchStockAdjustments(
  filters: InventoryListFilters = {},
): Promise<StockAdjustmentListResponse> {
  return bffRequest<StockAdjustmentListResponse>(
    `${BFF_INVENTORY_ROUTES.stockAdjustments.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchStockAdjustment(uuid: string): Promise<StockAdjustment> {
  return bffRequest<StockAdjustment>(
    BFF_INVENTORY_ROUTES.stockAdjustments.detail(uuid),
  );
}

export async function createStockAdjustment(
  payload: StockAdjustmentPayload,
): Promise<StockAdjustment> {
  return bffRequest<StockAdjustment>(
    BFF_INVENTORY_ROUTES.stockAdjustments.list,
    { method: "POST", body: payload },
  );
}

export async function updateStockAdjustment(
  uuid: string,
  payload: Partial<StockAdjustmentPayload>,
): Promise<StockAdjustment> {
  return bffRequest<StockAdjustment>(
    BFF_INVENTORY_ROUTES.stockAdjustments.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteStockAdjustment(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.stockAdjustments.detail(uuid), {
    method: "DELETE",
  });
}

export async function runStockAdjustmentAction(
  uuid: string,
  action: StockAdjustmentAction,
): Promise<StockAdjustment> {
  return bffRequest<StockAdjustment>(
    BFF_INVENTORY_ROUTES.stockAdjustments.action(uuid, action),
    { method: "POST" },
  );
}
