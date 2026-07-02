import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import {
  getLinePricingSnapshot,
  type PricingRuleSnapshot,
} from "@/features/sales-orders/types/line-payment-split.types";

export type InvoicePaymentRuleSummary = {
  key: string;
  ruleName: string;
  ruleTypesLabel: string;
  scopeType: string | null;
};

function formatRuleTypesLabel(ruleTypes: string[] | undefined): string {
  if (!ruleTypes?.length) {
    return "—";
  }

  return ruleTypes
    .map((type) => {
      if (type === "CO_PAYMENT") return "Co-payment";
      if (type === "EXCESS") return "Excess";
      if (type === "FORMULA") return "Formula";
      return type;
    })
    .join(", ");
}

function snapshotToSummary(snapshot: PricingRuleSnapshot): InvoicePaymentRuleSummary {
  const ruleName = snapshot.rule_name?.trim() || "Unnamed rule";
  const key = snapshot.rule_uuid?.trim() || ruleName;

  return {
    key,
    ruleName,
    ruleTypesLabel: formatRuleTypesLabel(snapshot.rule_types),
    scopeType: snapshot.scope_type?.trim() || null,
  };
}

export function collectInvoicePaymentRules(
  lines: InvoiceLine[] | undefined,
): InvoicePaymentRuleSummary[] {
  if (!lines?.length) {
    return [];
  }

  const rules = new Map<string, InvoicePaymentRuleSummary>();

  for (const line of lines) {
    const snapshot = getLinePricingSnapshot(line);
    if (!snapshot?.rule_name?.trim()) {
      continue;
    }

    const summary = snapshotToSummary(snapshot);
    rules.set(summary.key, summary);
  }

  return Array.from(rules.values());
}
