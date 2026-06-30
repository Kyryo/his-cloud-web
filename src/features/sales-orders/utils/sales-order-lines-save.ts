import type { CreateSalesOrderLinePayload } from "@/features/sales-orders/types/sales-order.types";
import {
  salesOrderLineDraftNeedsReplace,
  type SalesOrderLineDraft,
} from "@/features/sales-orders/types/sales-order-line-draft";

export type SavedSalesOrderLineSnapshot = {
  id: number | null;
  product_id: number | null;
  productName: string | null;
  tariff_code?: string | null;
  quantity: string;
  price_unit: string;
  price_total?: string | number | null;
};

export function parseSalesOrderLineSnapshot(
  snapshot: string,
): SavedSalesOrderLineSnapshot[] {
  return JSON.parse(snapshot) as SavedSalesOrderLineSnapshot[];
}

export function collectSalesOrderLineIdsToReplace(
  draftLines: SalesOrderLineDraft[],
  snapshot: SavedSalesOrderLineSnapshot[],
): Set<number> {
  const snapshotById = new Map(
    snapshot
      .filter((line) => line.id != null)
      .map((line) => [line.id!, line]),
  );

  return new Set(
    draftLines
      .filter((line) => line.id != null)
      .filter((line) => {
        const original = snapshotById.get(line.id!);
        return original && salesOrderLineDraftNeedsReplace(original, line);
      })
      .map((line) => line.id!),
  );
}

export function collectSalesOrderLinesToAdd(
  draftLines: SalesOrderLineDraft[],
  lineIdsToReplace: Set<number>,
): SalesOrderLineDraft[] {
  return draftLines.filter((line) => {
    if (!line.product_id && !line.product_uuid) {
      return false;
    }

    if (line.id != null && !lineIdsToReplace.has(line.id)) {
      return false;
    }

    return true;
  });
}

export function buildSalesOrderLineCreatePayload(
  line: SalesOrderLineDraft,
): CreateSalesOrderLinePayload | null {
  if (!line.product_id && !line.product_uuid) {
    return null;
  }

  const parsedQuantity = Number(line.quantity);
  const payload: CreateSalesOrderLinePayload = {
    quantity: parsedQuantity.toFixed(4),
    ...(line.product_id
      ? { product_id: line.product_id }
      : { product_uuid: line.product_uuid! }),
  };

  if (line.priceUnitOverridden && line.price_unit.trim()) {
    payload.price_unit = Number(line.price_unit).toFixed(4);
  }

  const code = (line.tariff_code ?? "").trim();
  if (code) {
    payload.tariff_code = code;
  }

  return payload;
}
