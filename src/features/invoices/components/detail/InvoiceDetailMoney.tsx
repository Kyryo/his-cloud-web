import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsurerDueLabel,
  getInvoiceOutstandingBalance,
  hasInvoiceBalance,
  hasInvoicePaymentSplit,
  sumInvoiceClientDue,
  sumInvoiceExcess,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";
import { cn } from "@/lib/utils";

type InvoiceDetailMoneyProps = {
  invoice: Invoice;
};

function MoneyFigure({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number | null | undefined;
  tone?: "default" | "danger" | "success";
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
          tone === "danger" && "text-red-600",
          tone === "success" && "text-emerald-700",
          tone === "default" && "text-brand-navy",
        )}
      >
        {formatInvoiceAmount(value)}
      </dd>
    </div>
  );
}

export function InvoiceDetailMoney({ invoice }: InvoiceDetailMoneyProps) {
  const hasBalance = hasInvoiceBalance(invoice);
  const showPaymentSplit = hasInvoicePaymentSplit(invoice);
  const excessTotal = sumInvoiceExcess(invoice);

  return (
    <div data-testid="invoice-detail-money">
      <dl className="grid grid-cols-3 gap-4">
        <MoneyFigure
          label={hasBalance ? "Due" : "Settled"}
          value={getInvoiceOutstandingBalance(invoice)}
          tone={hasBalance ? "danger" : "success"}
        />
        <MoneyFigure label="Paid" value={invoice.amount_paid} />
        <MoneyFigure label="Total" value={invoice.amount_total} />
      </dl>
      {showPaymentSplit ? (
        <p className="mt-3 text-xs text-brand-muted">
          {formatInvoiceInsurerDueLabel(invoice)}{" "}
          <span className="tabular-nums text-brand-navy">
            {formatInvoiceAmount(sumInvoiceInsurerDue(invoice))}
          </span>
          <span aria-hidden="true" className="px-1.5 text-brand-border">
            ·
          </span>
          Client due{" "}
          <span className="tabular-nums text-brand-navy">
            {formatInvoiceAmount(sumInvoiceClientDue(invoice))}
          </span>
          {excessTotal > 0 ? (
            <>
              <span aria-hidden="true" className="px-1.5 text-brand-border">
                ·
              </span>
              Excess{" "}
              <span className="tabular-nums text-brand-navy">
                {formatInvoiceAmount(excessTotal)}
              </span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
