import type { StockAdjustmentLine } from "@/features/inventory/types/inventory.types";
import type { AdjustmentType } from "@/features/inventory/types/inventory.types";
import type { StockAdjustmentLinePayload } from "@/features/inventory/services/stock-adjustments.service";

export type StockAdjustmentLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  product_uuid?: string | null;
  productName: string | null;
  quantity_delta: string;
  new_unit_cost: string;
  isNew?: boolean;
};

export function createEmptyStockAdjustmentLineDraft(): StockAdjustmentLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    productName: null,
    quantity_delta: "0",
    new_unit_cost: "0",
    isNew: true,
  };
}

export function stockAdjustmentLineToDraft(
  line: StockAdjustmentLine,
): StockAdjustmentLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    product_id: line.product_id,
    product_uuid: line.product_uuid ?? null,
    productName: line.product_name?.trim() || null,
    quantity_delta: String(line.quantity_delta),
    new_unit_cost:
      line.new_unit_cost != null ? String(line.new_unit_cost) : "0",
  };
}

export function stockAdjustmentDraftHasProduct(
  line: Pick<StockAdjustmentLineDraft, "product_id" | "product_uuid">,
): boolean {
  return Boolean(line.product_uuid || line.product_id);
}

/** Preserve selected labels and UUIDs when an update response omits them. */
export function preserveStockAdjustmentProductNames(
  nextDrafts: StockAdjustmentLineDraft[],
  previousDrafts: StockAdjustmentLineDraft[],
): StockAdjustmentLineDraft[] {
  const namesByProductId = new Map<number, string>();
  const namesByProductUuid = new Map<string, string>();
  const previousWithProduct = previousDrafts.filter(
    stockAdjustmentDraftHasProduct,
  );

  for (const line of previousDrafts) {
    const name = line.productName?.trim();
    if (!name) {
      continue;
    }
    if (line.product_id != null) {
      namesByProductId.set(line.product_id, name);
    }
    if (line.product_uuid) {
      namesByProductUuid.set(line.product_uuid, name);
    }
  }

  let productIndex = 0;
  return nextDrafts.map((draft) => {
    const previousMatch = stockAdjustmentDraftHasProduct(draft)
      ? previousWithProduct[productIndex]
      : undefined;
    if (stockAdjustmentDraftHasProduct(draft)) {
      productIndex += 1;
    }

    const preservedName =
      draft.productName?.trim() ||
      (draft.product_id != null
        ? namesByProductId.get(draft.product_id)
        : undefined) ||
      (draft.product_uuid
        ? namesByProductUuid.get(draft.product_uuid)
        : undefined) ||
      previousMatch?.productName?.trim() ||
      null;

    return {
      ...draft,
      product_uuid: draft.product_uuid ?? previousMatch?.product_uuid ?? null,
      productName: preservedName,
    };
  });
}

export function parseDraftNumber(value: string): number {
  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export function countSavedStockAdjustmentLineDrafts(
  lines: StockAdjustmentLineDraft[],
): number {
  return lines.filter(stockAdjustmentDraftHasProduct).length;
}

export function serializeStockAdjustmentDraftLines(
  lines: StockAdjustmentLineDraft[],
): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      product_uuid: line.product_uuid ?? null,
      productName: line.productName,
      quantity_delta: line.quantity_delta,
      new_unit_cost: line.new_unit_cost,
    })),
  );
}

export function draftsToStockAdjustmentLines(
  drafts: StockAdjustmentLineDraft[],
  adjustmentType: AdjustmentType,
): StockAdjustmentLinePayload[] {
  return drafts.filter(stockAdjustmentDraftHasProduct).map((line) => {
    const productRef = line.product_uuid
      ? { product_uuid: line.product_uuid }
      : { product_id: line.product_id! };

    if (adjustmentType === "COST") {
      return {
        id: line.id,
        ...productRef,
        quantity_delta: "0",
        new_unit_cost: line.new_unit_cost,
      };
    }

    return {
      id: line.id,
      ...productRef,
      quantity_delta: line.quantity_delta,
    };
  });
}

export function getStockAdjustmentLineValidationIssues(
  line: StockAdjustmentLineDraft,
  adjustmentType: AdjustmentType,
): string[] {
  if (!stockAdjustmentDraftHasProduct(line)) {
    return [];
  }

  const issues: string[] = [];
  if (adjustmentType === "COST") {
    if (parseDraftNumber(line.new_unit_cost) <= 0) {
      issues.push("new_unit_cost");
    }
  } else if (parseDraftNumber(line.quantity_delta) === 0) {
    issues.push("quantity_delta");
  }

  return issues;
}

export function countStockAdjustmentLinesWithValidationIssues(
  lines: StockAdjustmentLineDraft[],
  adjustmentType: AdjustmentType,
): number {
  return lines.filter(
    (line) =>
      getStockAdjustmentLineValidationIssues(line, adjustmentType).length > 0,
  ).length;
}

export function validateStockAdjustmentLinesForSubmit(
  lines: StockAdjustmentLineDraft[],
  adjustmentType: AdjustmentType,
): string | null {
  const savedLines = lines.filter(stockAdjustmentDraftHasProduct);

  if (savedLines.length === 0) {
    return "Add at least one line item before submitting.";
  }

  const invalidLine = savedLines.find(
    (line) =>
      getStockAdjustmentLineValidationIssues(line, adjustmentType).length > 0,
  );

  if (invalidLine) {
    if (adjustmentType === "COST") {
      return "Each line item must have a unit cost greater than zero.";
    }
    return "Each line item must have a non-zero quantity adjustment.";
  }

  return null;
}
