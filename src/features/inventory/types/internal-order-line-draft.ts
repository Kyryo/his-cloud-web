import type { InternalOrderLine } from "@/features/inventory/types/inventory.types";

export type InternalOrderLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  productName: string | null;
  quantity: string;
  batch?: number | null;
  batchNumber?: string | null;
  notes?: string | null;
  isNew?: boolean;
};

export type InternalOrderBatchValidationOptions = {
  batchTrackingEnabled?: boolean;
};

export function createEmptyInternalOrderLineDraft(): InternalOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    productName: null,
    quantity: "1",
    batch: null,
    batchNumber: null,
    isNew: true,
  };
}

export function internalOrderLineToDraft(line: InternalOrderLine): InternalOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    product_id: line.product_id,
    productName: line.product_name?.trim() || null,
    quantity: String(line.quantity),
    batch: line.batch ?? null,
    batchNumber: line.batch_number?.trim() || null,
    notes: line.notes ?? null,
  };
}

export function lineMissingBatch(
  line: {
    product_id: number | null;
    batch?: number | null;
  },
  options: InternalOrderBatchValidationOptions = {},
): boolean {
  if (!options.batchTrackingEnabled || !line.product_id) {
    return false;
  }

  return !line.batch;
}

export function countLinesMissingBatch(
  lines: Array<{
    product_id: number | null;
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
  if (!line.product_id) {
    return [];
  }

  const issues: string[] = [];
  if (lineMissingBatch(line, options)) {
    issues.push("batch");
  }
  if (parseDraftNumber(line.quantity) <= 0) {
    issues.push("quantity");
  }
  return issues;
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
  return lines.filter((line) => line.product_id).length;
}

export function draftsToInternalOrderLines(
  drafts: InternalOrderLineDraft[],
): InternalOrderLine[] {
  return drafts
    .filter((line) => line.product_id)
    .map((line) => ({
      id: line.id,
      product_id: line.product_id!,
      quantity: line.quantity,
      batch: line.batch ?? null,
      notes: line.notes?.trim() || null,
    }));
}

export function serializeInternalDraftLines(lines: InternalOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      productName: line.productName,
      quantity: line.quantity,
      batch: line.batch ?? null,
      batchNumber: line.batchNumber ?? null,
      notes: line.notes ?? null,
    })),
  );
}

export function validateInternalOrderLinesForSubmit(
  lines: InternalOrderLineDraft[],
): string | null {
  const savedLines = lines.filter((line) => line.product_id);

  if (savedLines.length === 0) {
    return "Add at least one line item before submitting.";
  }

  const invalidLine = savedLines.find((line) => parseDraftNumber(line.quantity) <= 0);
  if (invalidLine) {
    return "Each line item must have a quantity greater than zero.";
  }

  return null;
}
