export type SelectableSalesOrderLine = {
  id?: number;
  product_id: number | null;
  productName?: string | null;
  provider_id?: number | null;
  is_payable?: boolean;
  payability_overridden?: boolean;
  isNew?: boolean;
  quantity?: string | number | null;
};

export type SalesOrderMergePreview = {
  productName: string;
  quantity: number;
  lineIds: number[];
};

export function savedSelectableLines<T extends SelectableSalesOrderLine>(
  lines: T[],
): T[] {
  return lines.filter((line) => line.id != null && line.isNew !== true);
}

export function mergePreviewForSelection<T extends SelectableSalesOrderLine>(
  lines: T[],
  selectedIds: number[],
): SalesOrderMergePreview | null {
  const selected = new Set(selectedIds);
  const chosen = savedSelectableLines(lines).filter(
    (line) => line.id != null && selected.has(line.id),
  );
  if (chosen.length < 2) {
    return null;
  }

  const productIds = new Set(chosen.map((line) => line.product_id));
  const providerIds = new Set(chosen.map((line) => line.provider_id ?? null));
  const payability = new Set(
    chosen.map(
      (line) =>
        `${line.is_payable === true}:${line.payability_overridden === true}`,
    ),
  );
  if (
    productIds.size !== 1 ||
    productIds.has(null) ||
    providerIds.size !== 1 ||
    payability.size !== 1
  ) {
    return null;
  }

  const quantity = chosen.reduce((total, line) => {
    const value = Number(line.quantity ?? 0);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);

  return {
    productName: chosen[0]?.productName?.trim() || "this item",
    quantity,
    lineIds: chosen.map((line) => line.id as number),
  };
}
