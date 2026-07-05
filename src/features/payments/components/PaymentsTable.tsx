"use client";

import Link from "next/link";

import { TableAmountCell, TableEntityCell, TableTextCell } from "@/components/table-text-cell";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PaymentsTableProps = {
  payments: Payment[];
  onRowClick?: (payment: Payment) => void;
  className?: string;
};

const columns = [
  { key: "payment", label: "Payment" },
  { key: "customer", label: "Customer" },
  { key: "invoice", label: "Invoice" },
  { key: "date", label: "Payment date" },
  { key: "method", label: "Method" },
  { key: "state", label: "State" },
  { key: "amount", label: "Amount" },
] as const;

export function PaymentsTable({ payments, onRowClick, className }: PaymentsTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-brand-border bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-brand-muted",
                    column.key === "amount" ? "text-right" : "text-left",
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {payments.map((payment) => {
              const paymentLabel = payment.name || `#${payment.id}`;
              const customerName = formatPaymentCustomer(payment);
              const invoiceLabel = payment.invoice_name || `#${payment.invoice_id}`;

              return (
                <tr
                  key={payment.id}
                  className={cn(onRowClick && "cursor-pointer hover:bg-slate-50/80")}
                  onClick={() => onRowClick?.(payment)}
                  data-testid={`payment-row-${payment.id}`}
                >
                  <td className="px-4 py-3">
                    <TableTextCell className="font-medium text-brand-navy">
                      {paymentLabel}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3">
                    <TableEntityCell
                      name={customerName}
                      href={
                        payment.customer_uuid
                          ? ROUTES.customerDetail(payment.customer_uuid)
                          : undefined
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {payment.invoice_id ? (
                      <Link
                        href={ROUTES.invoiceDetail(payment.invoice_id)}
                        className="block max-w-[12rem] truncate text-sm text-brand-slate hover:text-brand-primary hover:underline"
                        title={invoiceLabel}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {invoiceLabel}
                      </Link>
                    ) : (
                      <TableTextCell className="text-brand-slate">—</TableTextCell>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TableTextCell className="text-brand-slate">
                      {formatPaymentDate(payment.payment_date)}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3">
                    <TableTextCell className="text-brand-slate">
                      {formatPaymentMethod(payment.payment_method)}
                    </TableTextCell>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <PaymentStatusBadge state={payment.state} />
                  </td>
                  <td className="px-4 py-3">
                    <TableAmountCell value={payment.amount} currency="MWK" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PaymentsPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function PaymentsPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: PaymentsPaginationProps) {
  const hasNext = page * pageSize < totalCount;
  const hasPrevious = page > 1;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-brand-muted">
        Showing {paymentsRangeLabel(page, pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function paymentsRangeLabel(page: number, pageSize: number, totalCount: number) {
  if (totalCount === 0) {
    return "0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `${start}-${end}`;
}
