import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InventoryBatch,
  InventoryBatchListResponse,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type CreateBatchPayload = {
  tenant: number;
  product_id: number;
  batch_number: string;
  expiry_date?: string | null;
  manufacture_date?: string | null;
  supplier?: string | null;
  notes?: string | null;
  is_active?: boolean;
};

export type UpdateBatchPayload = Partial<CreateBatchPayload>;

export async function fetchInventoryBatches(
  filters: InventoryListFilters = {},
): Promise<InventoryBatchListResponse> {
  return bffRequest<InventoryBatchListResponse>(
    `${BFF_INVENTORY_ROUTES.batches.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInventoryBatch(uuid: string): Promise<InventoryBatch> {
  return bffRequest<InventoryBatch>(BFF_INVENTORY_ROUTES.batches.detail(uuid));
}

export async function createInventoryBatch(
  payload: CreateBatchPayload,
): Promise<InventoryBatch> {
  return bffRequest<InventoryBatch>(BFF_INVENTORY_ROUTES.batches.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateInventoryBatch(
  uuid: string,
  payload: UpdateBatchPayload,
): Promise<InventoryBatch> {
  return bffRequest<InventoryBatch>(BFF_INVENTORY_ROUTES.batches.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteInventoryBatch(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.batches.detail(uuid), {
    method: "DELETE",
  });
}
