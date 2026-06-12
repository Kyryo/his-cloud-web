import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InternalOrder,
  InternalOrderLine,
  InternalOrderListResponse,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type InternalOrderPayload = {
  source_location: number;
  destination_location: number;
  notes?: string | null;
  lines?: InternalOrderLine[];
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
