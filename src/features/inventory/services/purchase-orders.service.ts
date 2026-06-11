import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import type {
  InventoryListFilters,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderListResponse,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";

export type PurchaseOrderPayload = {
  vendor_name: string;
  vendor_id?: number | null;
  lpo_number?: string | null;
  grn_number?: string | null;
  delivery_date?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  receiving_location: number;
  notes?: string | null;
  lines: PurchaseOrderLine[];
  is_active?: boolean;
};

export type PurchaseOrderAction = "submit" | "confirm" | "cancel";

export async function fetchPurchaseOrders(
  filters: InventoryListFilters = {},
): Promise<PurchaseOrderListResponse> {
  return bffRequest<PurchaseOrderListResponse>(
    `${BFF_INVENTORY_ROUTES.purchaseOrders.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchPurchaseOrder(uuid: string): Promise<PurchaseOrder> {
  return bffRequest<PurchaseOrder>(
    BFF_INVENTORY_ROUTES.purchaseOrders.detail(uuid),
  );
}

export async function createPurchaseOrder(
  payload: PurchaseOrderPayload,
): Promise<PurchaseOrder> {
  return bffRequest<PurchaseOrder>(BFF_INVENTORY_ROUTES.purchaseOrders.list, {
    method: "POST",
    body: payload,
  });
}

export async function updatePurchaseOrder(
  uuid: string,
  payload: Partial<PurchaseOrderPayload>,
): Promise<PurchaseOrder> {
  return bffRequest<PurchaseOrder>(
    BFF_INVENTORY_ROUTES.purchaseOrders.detail(uuid),
    { method: "PATCH", body: payload },
  );
}

export async function deletePurchaseOrder(uuid: string): Promise<void> {
  await bffRequest<void>(BFF_INVENTORY_ROUTES.purchaseOrders.detail(uuid), {
    method: "DELETE",
  });
}

export async function runPurchaseOrderAction(
  uuid: string,
  action: PurchaseOrderAction,
): Promise<PurchaseOrder> {
  return bffRequest<PurchaseOrder>(
    BFF_INVENTORY_ROUTES.purchaseOrders.action(uuid, action),
    { method: "POST" },
  );
}
