import {
  DetailPageAsideSummaryField,
} from "@/features/app-shell/components/page-layout";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoicePricelist,
} from "@/features/invoices/utils/format-invoice";
import { formatInvoiceInsuranceNumber } from "@/features/invoices/utils/format-invoice-insurance";
import {
  formatInvoiceInsurerDueLabel,
  hasInvoicePaymentSplit,
  sumInvoiceClientDue,
  sumInvoiceExcess,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";

type InvoiceLineBillingSummaryProps = {
  invoice: Invoice;
};

export function InvoiceLineBillingSummary({
  invoice,
}: InvoiceLineBillingSummaryProps) {
  const insuranceNumber = formatInvoiceInsuranceNumber(invoice);
  const showSplit = hasInvoicePaymentSplit(invoice);
  const excessTotal = sumInvoiceExcess(invoice);

  return (
    <dl
      className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-dash-border/80 pt-4 sm:grid-cols-3"
      data-testid="invoice-lines-billing"
    >
      {showSplit ? (
        <>
          <DetailPageAsideSummaryField
            label={formatInvoiceInsurerDueLabel(invoice)}
            value={formatInvoiceAmount(sumInvoiceInsurerDue(invoice))}
          />
          <DetailPageAsideSummaryField
            label="Client due"
            value={formatInvoiceAmount(sumInvoiceClientDue(invoice))}
          />
          {excessTotal > 0 ? (
            <DetailPageAsideSummaryField
              label="Excess"
              value={formatInvoiceAmount(excessTotal)}
            />
          ) : null}
        </>
      ) : null}
      <DetailPageAsideSummaryField
        label="Gross"
        value={formatInvoiceAmount(invoice.amount_untaxed)}
      />
      <DetailPageAsideSummaryField
        label="Tax"
        value={formatInvoiceAmount(invoice.amount_tax)}
      />
      <DetailPageAsideSummaryField
        label="Pricelist"
        value={formatInvoicePricelist(invoice)}
      />
      {insuranceNumber !== "—" ? (
        <DetailPageAsideSummaryField
          label="Membership"
          value={<span className="font-mono">{insuranceNumber}</span>}
        />
      ) : null}
      {invoice.authorization_number ? (
        <DetailPageAsideSummaryField
          label="Authorization"
          value={
            <span className="font-mono">{invoice.authorization_number}</span>
          }
        />
      ) : null}
    </dl>
  );
}
