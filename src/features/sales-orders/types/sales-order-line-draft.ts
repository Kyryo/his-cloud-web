import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

export type SalesOrderLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  product_uuid?: string | null;
  productName: string | null;
  tariff_code?: string | null;
  quantity: string;
  price_unit: string;
  price_total?: string | number | null;
  is_payable?: boolean;
  priceUnitOverridden?: boolean;
  isNew?: boolean;
};

export function createEmptySalesOrderLineDraft(): SalesOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    productName: null,
    quantity: "1",
    price_unit: "",
    isNew: true,
  };
}

export function salesOrderLineToDraft(line: SalesOrderLine): SalesOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    product_id: line.product_id,
    productName: line.product_name?.trim() || line.name?.trim() || null,
    tariff_code: line.tariff_code ?? null,
    quantity: line.quantity != null ? String(line.quantity) : "1",
    price_unit: line.price_unit != null ? String(line.price_unit) : "",
    price_total: line.price_total,
    is_payable: line.is_payable,
  };
}

export function linesMissingProductName(lines: SalesOrderLineDraft[]): boolean {
  return lines.some((line) => line.product_id && !line.productName);
}

export function calculateSalesOrderLineDraftTotal(line: SalesOrderLineDraft): number {
  const quantity = Number(line.quantity);
  const price = Number(line.price_unit);

  if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
    return 0;
  }

  return quantity * price;
}

export function serializeSalesOrderDraftLines(lines: SalesOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      productName: line.productName,
      tariff_code: line.tariff_code ?? null,
      quantity: line.quantity,
      price_unit: line.price_unit,
      price_total: line.price_total ?? null,
    })),
  );
}

export function salesOrderLineDraftNeedsReplace(
  original: Pick<SalesOrderLineDraft, "product_id" | "quantity">,
  line: Pick<SalesOrderLineDraft, "product_id" | "quantity">,
): boolean {
  return (
    original.product_id !== line.product_id || original.quantity !== line.quantity
  );
}

export function validateSalesOrderLinesForSave(
  lines: SalesOrderLineDraft[],
): string | null {
  for (const line of lines) {
    const hasProductReference =
      line.product_id != null || Boolean(line.product_uuid);

    if (line.isNew && !hasProductReference) {
      return "Confirm or remove new line items before saving.";
    }

    const hasProductSelection =
      hasProductReference || Boolean(line.productName?.trim());

    if (hasProductSelection && line.product_id == null && !line.product_uuid) {
      return "Each line item must have a product selected.";
    }
  }

  const pendingLines = lines.filter(
    (line) => line.product_id != null || Boolean(line.product_uuid),
  );

  for (const line of pendingLines) {
    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Each line item must have a quantity greater than zero.";
    }

    if (line.price_unit.trim()) {
      const price = Number(line.price_unit);
      if (!Number.isFinite(price) || price < 0) {
        return "Each line item must have a unit price of zero or greater.";
      }
    }
  }

  return null;
}
