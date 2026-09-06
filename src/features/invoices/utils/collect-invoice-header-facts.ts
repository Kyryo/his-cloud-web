import { ROUTES } from "@/constants/routes";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoicePricelist } from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import { collectInvoicePaymentRules } from "@/features/invoices/utils/collect-invoice-payment-rules";

export type InvoiceHeaderFact = {
  key: string;
  label: string;
  value: string;
  href?: string;
};

export function collectInvoiceHeaderFacts(invoice: Invoice): InvoiceHeaderFact[] {
  const facts: InvoiceHeaderFact[] = [];
  const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
  const insuranceNumber = formatInvoiceInsuranceNumber(invoice);
  const paymentRule = collectInvoicePaymentRules(invoice.lines)[0];

  if (insuranceLabel !== "—") {
    facts.push({ key: "payer", label: "Payer", value: insuranceLabel });
  }
  if (insuranceNumber !== "—") {
    facts.push({ key: "membership", label: "Membership", value: insuranceNumber });
  }
  if (invoice.authorization_number?.trim()) {
    facts.push({
      key: "authorization",
      label: "Authorization",
      value: invoice.authorization_number.trim(),
    });
  }
  if (invoice.sales_order_id) {
    facts.push({
      key: "sales-order",
      label: "Sales order",
      value: invoice.sales_order_name || `#${invoice.sales_order_id}`,
      href: ROUTES.salesOrderDetail(
        invoice.sales_order_uuid ?? invoice.sales_order_id,
      ),
    });
  }
  if (invoice.invoice_origin?.trim()) {
    facts.push({
      key: "origin",
      label: "Origin",
      value: invoice.invoice_origin.trim(),
    });
  }
  if (invoice.internal_reference?.trim()) {
    facts.push({
      key: "reference",
      label: "Reference",
      value: invoice.internal_reference.trim(),
    });
  }

  facts.push({
    key: "pricelist",
    label: "Pricelist",
    value: formatInvoicePricelist(invoice),
  });
  facts.push({
    key: "rules",
    label: "Rules",
    value: paymentRule?.ruleName ?? "List price",
  });

  return facts;
}
