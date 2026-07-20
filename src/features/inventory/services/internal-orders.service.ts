import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InternalOrder,
  InternalOrderListResponse,
  InventoryProduct,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import type { InternalOrderLinePayload } from "@/features/inventory/types/internal-order-line-draft";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type InternalOrderPayload = {
  source_location: number;
  destination_location: number;
  notes?: string | null;
  lines?: InternalOrderLinePayload[];
  is_active?: boolean;
};

export type InternalOrderAction =
  | "submit"
  | "approve"
  | "reject"
  | "dispatch"
  | "receive"
  | "cancel";

export async function fetchInternalOrders(
  filters: InventoryListFilters = {},
): Promise<InternalOrderListResponse> {
  return bffRequest<InternalOrderListResponse>(
    `${BFF_INVENTORY_ROUTES.internalOrders.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInternalOrder(uuid: string): Promise<InternalOrder> {
  return bffRequest<InternalOrder>(
    BFF_INVENTORY_ROUTES.internalOrders.detail(uuid),
  );
}

export async function searchInternalOrderAvailableProducts(
  uuid: string,
  query: string,
): Promise<InventoryProduct[]> {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  return bffRequest<InventoryProduct[]>(
    `${BFF_INVENTORY_ROUTES.internalOrders.availableProducts(uuid)}${suffix}`,
  );
}

export async function createInternalOrder(
  payload: InternalOrderPayload,
): Promise<InternalOrder> {
  return bffRequest<InternalOrder>(BFF_INVENTORY_ROUTES.internalOrders.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateInternalOrder(
  uuid: string,
  payload: Partial<InternalOrderPayload>,
): Promise<InternalOrder> {
  return bffRequest<InternalOrder>(
    BFF_INVENTORY_ROUTES.internalOrders.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function deleteInternalOrder(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.internalOrders.detail(uuid), {
    method: "DELETE",
  });
}

export async function runInternalOrderAction(
  uuid: string,
  action: InternalOrderAction,
): Promise<InternalOrder> {
  return bffRequest<InternalOrder>(
    BFF_INVENTORY_ROUTES.internalOrders.action(uuid, action),
    { method: "POST" },
  );
}
