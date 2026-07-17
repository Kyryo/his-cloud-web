import type { PricingRuleSnapshot } from "@/features/sales-orders/types/line-payment-split.types";
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

export const SPLIT_ROUNDING_TOLERANCE = 0.01;

export type LineSplitMismatch = {
  newTotal: number;
  splitTotal: number;
  delta: number;
};

function parseAmount(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function amountsReconcile(
  left: number,
  right: number,
  tolerance = SPLIT_ROUNDING_TOLERANCE,
): boolean {
  return Math.abs(left - right) <= tolerance;
}

export function isCoPaymentLine(draft: Pick<SalesOrderLineDraft, "isCoPayment">): boolean {
  return Boolean(draft.isCoPayment);
}

function hasSavedLineSplit(line: {
  client_due?: string | number | null;
  insurer_due?: string | number | null;
}): boolean {
  return parseAmount(line.insurer_due) > 0 || parseAmount(line.client_due) > 0;
}

function isCoPaymentSavedLine(line: {
  pricing_rule_snapshot?: PricingRuleSnapshot | Record<string, unknown> | null;
}): boolean {
  const ruleTypes = (line.pricing_rule_snapshot as PricingRuleSnapshot | undefined)
    ?.rule_types;
  return Array.isArray(ruleTypes) && ruleTypes.includes("CO_PAYMENT");
}

function getEffectiveSplitTotal(draft: SalesOrderLineDraft): number {
  const clientDue = parseAmount(draft.adjustedClientDue ?? draft.client_due);
  const insurerDue = parseAmount(draft.adjustedInsurerDue ?? draft.insurer_due);
  return clientDue + insurerDue;
}

function hasEditedUnitPrice(draft: SalesOrderLineDraft): boolean {
  if (draft.originalPriceUnit == null) {
    return false;
  }

  return draft.price_unit.trim() !== draft.originalPriceUnit.trim();
}

export function getLineSplitMismatch(
  draft: SalesOrderLineDraft,
): LineSplitMismatch | null {
  if (draft.id == null || !isCoPaymentLine(draft)) {
    return null;
  }

  if (!hasEditedUnitPrice(draft)) {
    return null;
  }

  const quantity = parseAmount(draft.quantity);
  const priceUnit = parseAmount(draft.price_unit);
  const newTotal = quantity * priceUnit;
  const splitTotal = getEffectiveSplitTotal(draft);
  const delta = splitTotal - newTotal;

  if (amountsReconcile(splitTotal, newTotal)) {
    return null;
  }

  return { newTotal, splitTotal, delta };
}

export function getSalesOrderSplitMismatchKeys(
  draftLines: SalesOrderLineDraft[],
): Set<string> {
  const keys = new Set<string>();

  for (const line of draftLines) {
    if (getLineSplitMismatch(line)) {
      keys.add(line.key);
    }
  }

  return keys;
}

export function hasSavedSplitMismatch(
  order: Pick<SalesOrder, "lines">,
): boolean {
  for (const line of order.lines ?? []) {
    if (!hasSavedLineSplit(line) && !isCoPaymentSavedLine(line)) {
      continue;
    }

    const splitTotal =
      parseAmount(line.client_due) + parseAmount(line.insurer_due);
    const lineTotal = parseAmount(line.price_total);

    if (!amountsReconcile(splitTotal, lineTotal)) {
      return true;
    }
  }

  return false;
}

export function formatSplitMismatchDirection(delta: number): "over" | "under" {
  return delta > 0 ? "over" : "under";
}
