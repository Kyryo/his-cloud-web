"use client";

import Link from "next/link";

import { TableAmountCell } from "@/components/table-text-cell";
import { UserIdenticon } from "@/components/UserIdenticon";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAllocationLabel,
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";

type PaymentsTableProps = {
  payments: Payment[];
  onRowClick?: (payment: Payment) => void;
  className?: string;
};

const columns = [
  { key: "payment", label: "Payment" },
  { key: "customer", label: "Client" },
  { key: "invoice", label: "Allocation" },
  { key: "date", label: "Payment date" },
  { key: "method", label: "Method", className: "hidden md:table-cell" },
  { key: "state", label: "State" },
  { key: "amount", label: "Amount", className: "text-right pr-4" },
] as const;

export const PAYMENT_TABLE_SKELETON_COLUMNS = [
  { key: "payment", label: "Payment" },
  { key: "customer", label: "Client" },
  { key: "invoice", label: "Allocation" },
  { key: "date", label: "Payment date" },
  { key: "method", label: "Method", headerClassName: "hidden md:table-cell" },
  { key: "state", label: "State" },
  { key: "amount", label: "Amount", headerClassName: "text-right pr-4" },
] as const;

export function PaymentsTable({ payments, onRowClick, className }: PaymentsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell key={column.key} className={column.className}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {payments.map((payment) => {
          const paymentLabel = payment.name || `#${payment.id}`;
          const customerName = formatPaymentCustomer(payment);
          const allocationLabel = formatPaymentAllocationLabel(payment);
          const invoiceHref =
            payment.invoice_uuid ?? payment.invoice_id
              ? ROUTES.invoiceDetail(payment.invoice_uuid ?? payment.invoice_id)
              : null;

          return (
            <ListPageDataTableRow
              key={payment.id}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(payment)}
              data-testid={`payment-row-${payment.id}`}
            >
              <ListPageDataTableCell className="py-3">
                <span className="font-mono text-xs font-semibold tracking-tight text-brand-navy group-hover:text-brand-primary">
                  {paymentLabel}
                </span>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                {payment.customer_uuid ? (
                  <Link
                    href={ROUTES.customerDetail(payment.customer_uuid)}
                    className="flex min-w-0 items-center gap-2.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <UserIdenticon
                      seed={customerName}
                      name={customerName}
                      className="size-7.5 shrink-0 rounded-lg shadow-2xs"
                    />
                    <span className="truncate text-sm font-medium text-brand-navy hover:text-brand-primary">
                      {customerName}
                    </span>
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserIdenticon
                      seed={customerName}
                      name={customerName}
                      className="size-7.5 shrink-0 rounded-lg shadow-2xs"
                    />
                    <span className="truncate text-sm font-medium text-brand-navy">
                      {customerName}
                    </span>
                  </div>
                )}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                {invoiceHref ? (
                  <Link
                    href={invoiceHref}
                    className="block max-w-48 truncate text-xs text-brand-slate hover:text-brand-primary hover:underline"
                    title={allocationLabel}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {allocationLabel}
                  </Link>
                ) : (
                  <span className="text-xs text-brand-slate">{allocationLabel}</span>
                )}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 text-xs tabular-nums text-dash-muted">
                {formatPaymentDate(payment.payment_date)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden py-3 text-xs text-brand-slate md:table-cell">
                {formatPaymentMethod(payment.payment_method)}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3">
                <PaymentStatusBadge state={payment.state} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <div className="text-sm font-semibold tabular-nums text-brand-navy">
                  <TableAmountCell value={payment.amount} currency="MWK" />
                </div>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
