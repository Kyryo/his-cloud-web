import type { InternalOrderLine } from "@/features/inventory/types/inventory.types";

export type InternalOrderLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  product_uuid?: string | null;
  productName: string | null;
  quantity: string;
  quantityAvailable?: string | number | null;
  batch?: number | null;
  batchNumber?: string | null;
  notes?: string | null;
  isNew?: boolean;
};

export type InternalOrderLinePayload = {
  id?: number;
  product_id?: number;
  product_uuid?: string;
  quantity: string | number;
  batch?: number | null;
  notes?: string | null;
};

export type InternalOrderBatchValidationOptions = {
  batchTrackingEnabled?: boolean;
};

export function draftHasProduct(line: {
  product_id: number | null;
  product_uuid?: string | null;
}): boolean {
  return Boolean(line.product_uuid || line.product_id);
}

export function createEmptyInternalOrderLineDraft(): InternalOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    product_uuid: null,
    productName: null,
    quantity: "1",
    quantityAvailable: null,
    batch: null,
    batchNumber: null,
    isNew: true,
  };
}

export function internalOrderLineToDraft(line: InternalOrderLine): InternalOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    product_id: line.product_id ?? null,
    product_uuid: line.product_uuid ?? null,
    productName: line.product_name?.trim() || null,
    quantity: String(line.quantity),
    quantityAvailable: line.quantity_available ?? null,
    batch: line.batch ?? null,
    batchNumber: line.batch_number?.trim() || null,
    notes: line.notes ?? null,
  };
}

/**
 * Keep display names / UUIDs / availability from the editor when the API omits
 * them (product_uuid is write-only; product_name can briefly be null).
 */
export function preserveProductNamesInDrafts(
  nextDrafts: InternalOrderLineDraft[],
  previousDrafts: InternalOrderLineDraft[],
): InternalOrderLineDraft[] {
  const namesByProductId = new Map<number, string>();
  const namesByProductUuid = new Map<string, string>();
  const availabilityByProductId = new Map<number, string | number>();
  const availabilityByProductUuid = new Map<string, string | number>();
  const previousWithProduct = previousDrafts.filter(draftHasProduct);

  for (const line of previousDrafts) {
    const name = line.productName?.trim();
    if (name) {
      if (line.product_id != null) {
        namesByProductId.set(line.product_id, name);
      }
      if (line.product_uuid) {
        namesByProductUuid.set(line.product_uuid, name);
      }
    }
    if (line.quantityAvailable != null) {
      if (line.product_id != null) {
        availabilityByProductId.set(line.product_id, line.quantityAvailable);
      }
      if (line.product_uuid) {
        availabilityByProductUuid.set(line.product_uuid, line.quantityAvailable);
      }
    }
  }

  let productIndex = 0;

  return nextDrafts.map((draft) => {
    const previousMatch = draftHasProduct(draft)
      ? previousWithProduct[productIndex]
      : undefined;

    if (draftHasProduct(draft)) {
      productIndex += 1;
    }

    const existingName = draft.productName?.trim();
    const byId =
      draft.product_id != null ? namesByProductId.get(draft.product_id) : undefined;
    const byUuid = draft.product_uuid
      ? namesByProductUuid.get(draft.product_uuid)
      : undefined;
    const preservedName = existingName || byId || byUuid || previousMatch?.productName?.trim();

    const existingAvailability = draft.quantityAvailable;
    const availableById =
      draft.product_id != null
        ? availabilityByProductId.get(draft.product_id)
        : undefined;
    const availableByUuid = draft.product_uuid
      ? availabilityByProductUuid.get(draft.product_uuid)
      : undefined;
    const preservedAvailability =
      existingAvailability ??
      availableById ??
      availableByUuid ??
      previousMatch?.quantityAvailable ??
      null;

    const preservedUuid = draft.product_uuid ?? previousMatch?.product_uuid ?? null;

    if (
      preservedName === (draft.productName?.trim() || null) &&
      preservedAvailability === (draft.quantityAvailable ?? null) &&
      preservedUuid === (draft.product_uuid ?? null)
    ) {
      return draft;
    }

    return {
      ...draft,
      productName: preservedName || draft.productName,
      product_uuid: preservedUuid,
      quantityAvailable: preservedAvailability,
    };
  });
}

export function lineMissingBatch(
  line: {
    product_id: number | null;
    product_uuid?: string | null;
    batch?: number | null;
  },
  options: InternalOrderBatchValidationOptions = {},
): boolean {
  if (!options.batchTrackingEnabled || !draftHasProduct(line)) {
    return false;
  }

  return !line.batch;
}

export function countLinesMissingBatch(
  lines: Array<{
    product_id: number | null;
    product_uuid?: string | null;
    batch?: number | null;
  }>,
  options: InternalOrderBatchValidationOptions = {},
): number {
  return lines.filter((line) => lineMissingBatch(line, options)).length;
}

export function getInternalLineValidationIssues(
  line: InternalOrderLineDraft,
  options: InternalOrderBatchValidationOptions = {},
): string[] {
  if (!draftHasProduct(line)) {
    return [];
  }

  const issues: string[] = [];
  if (lineMissingBatch(line, options)) {
    issues.push("batch");
  }
  if (parseDraftNumber(line.quantity) <= 0) {
    issues.push("quantity");
  }
  if (lineHasZeroSourceAvailability(line)) {
    issues.push("availability");
  }
  return issues;
}

export function lineHasZeroSourceAvailability(line: InternalOrderLineDraft): boolean {
  if (!draftHasProduct(line) || line.quantityAvailable == null) {
    return false;
  }
  return Number(line.quantityAvailable) <= 0;
}

export function getZeroSourceAvailabilityLines(
  lines: InternalOrderLineDraft[],
): InternalOrderLineDraft[] {
  return lines.filter(lineHasZeroSourceAvailability);
}

export function countInternalLinesWithValidationIssues(
  lines: InternalOrderLineDraft[],
  options: InternalOrderBatchValidationOptions = {},
): number {
  return lines.filter((line) => getInternalLineValidationIssues(line, options).length > 0)
    .length;
}

export function parseDraftNumber(value: string): number {
  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export function countSavedInternalLineDrafts(lines: InternalOrderLineDraft[]): number {
  return lines.filter(draftHasProduct).length;
}

export function draftsToInternalOrderLines(
  drafts: InternalOrderLineDraft[],
): InternalOrderLinePayload[] {
  return drafts.filter(draftHasProduct).map((line) => {
    const productRef = line.product_uuid
      ? { product_uuid: line.product_uuid }
      : { product_id: line.product_id! };

    return {
      id: line.id,
      ...productRef,
      quantity: line.quantity,
      batch: line.batch ?? null,
      notes: line.notes?.trim() || null,
    };
  });
}

export function serializeInternalDraftLines(lines: InternalOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      product_uuid: line.product_uuid ?? null,
      productName: line.productName,
      quantity: line.quantity,
      quantityAvailable: line.quantityAvailable ?? null,
      batch: line.batch ?? null,
      batchNumber: line.batchNumber ?? null,
      notes: line.notes ?? null,
    })),
  );
}

export function validateInternalOrderLinesForSave(
  lines: InternalOrderLineDraft[],
): string | null {
  const savedLines = lines.filter(draftHasProduct);

  // Draft saves may clear every product line (e.g. after removing a zero-stock
  // item). Submit still requires at least one line.
  if (savedLines.length === 0) {
    return null;
  }

  const invalidLine = savedLines.find((line) => parseDraftNumber(line.quantity) <= 0);
  if (invalidLine) {
    return "Each line item must have a quantity greater than zero.";
  }

  const requestedByProduct = new Map<
    string,
    { requested: number; available: number | null; name: string }
  >();
  for (const line of savedLines) {
    const key = line.product_uuid ?? String(line.product_id);
    const current = requestedByProduct.get(key) ?? {
      requested: 0,
      available:
        line.quantityAvailable == null
          ? null
          : Number(line.quantityAvailable),
      name: line.productName?.trim() || "Selected product",
    };
    current.requested += parseDraftNumber(line.quantity);
    if (current.available == null && line.quantityAvailable != null) {
      current.available = Number(line.quantityAvailable);
    }
    requestedByProduct.set(key, current);
  }
  for (const { requested, available, name } of requestedByProduct.values()) {
    if (available != null && requested > available) {
      return `${name} has only ${available} available at the source location.`;
    }
  }

  return null;
}

export function validateInternalOrderLinesForSubmit(
  lines: InternalOrderLineDraft[],
): string | null {
  const savedLines = lines.filter(draftHasProduct);
  if (savedLines.length === 0) {
    return "Add at least one line item before submitting.";
  }
  return validateInternalOrderLinesForSave(lines);
}
