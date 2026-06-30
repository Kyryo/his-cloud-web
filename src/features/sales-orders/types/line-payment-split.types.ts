import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

export type PricingRuleSnapshot = {
  rule_uuid?: string | null;
  rule_name?: string | null;
  scope_type?: string | null;
  rule_types?: string[];
  client_liability_formula?: string | null;
  insurer_max_amount?: string | null;
  inputs?: {
    list_price?: string;
    pricelist_amount?: string;
    quantity?: string;
  };
  computed?: {
    insurer_unit?: string;
    client_unit?: string;
    excess_per_unit?: string;
  };
};

export type LinePaymentSplitFields = {
  list_price_at_order?: string | number | null;
  pricelist_amount_at_order?: string | number | null;
  insurer_due?: string | number | null;
  client_due?: string | number | null;
  has_excess?: boolean;
  excess_amount?: string | number | null;
  pricing_rule_snapshot?: PricingRuleSnapshot | null;
};

export function hasLinePaymentSplit(line: LinePaymentSplitFields): boolean {
  const insurer = Number(line.insurer_due ?? 0);
  const client = Number(line.client_due ?? 0);
  return insurer > 0 || client > 0;
}

export function getLinePricingSnapshot(
  line: LinePaymentSplitFields,
): PricingRuleSnapshot | null {
  const snapshot = line.pricing_rule_snapshot;
  if (!snapshot || Object.keys(snapshot).length === 0) {
    return null;
  }
  return snapshot;
}

export type PricingBreakdownLine = SalesOrderLine | InvoiceLine;
