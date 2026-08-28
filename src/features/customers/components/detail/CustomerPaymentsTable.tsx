"use client";

import { TableAmountCell, TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import type { CustomerPaymentRecord } from "@/features/customers/types/customer-billing.types";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import type { PaymentState } from "@/features/payments/types/payment.types";
import {
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";

type CustomerPaymentsTableProps = {
  payments: CustomerPaymentRecord[];
  onRowClick?: (payment: CustomerPaymentRecord) => void;
};

function allocationLabel(payment: CustomerPaymentRecord): string {
  if (payment.applies_to_opening_balance) {
    return "Opening balance";
  }
  if (payment.invoice_name?.trim()) {
    return payment.invoice_name.trim();
  }
  if (payment.invoice_id) {
    return `#${payment.invoice_id}`;
  }
  return "—";
}

export function CustomerPaymentsTable({
  payments,
  onRowClick,
}: CustomerPaymentsTableProps) {
  const columns: InventoryListTableColumn<CustomerPaymentRecord>[] = [
    {
      key: "payment",
      label: "Payment",
      render: (payment) => (
        <TableTextCell className="font-medium text-brand-navy">
          {payment.name || `#${payment.id}`}
        </TableTextCell>
      ),
    },
    {
      key: "allocation",
      label: "Allocation",
      render: (payment) => (
        <TableTextCell className="text-brand-slate">
          {allocationLabel(payment)}
        </TableTextCell>
      ),
    },
    {
      key: "date",
      label: "Payment date",
      render: (payment) => (
        <TableTextCell className="text-brand-slate">
          {formatPaymentDate(payment.payment_date)}
        </TableTextCell>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (payment) => (
        <TableTextCell className="text-brand-slate">
          {formatPaymentMethod(payment.payment_method)}
        </TableTextCell>
      ),
    },
    {
      key: "state",
      label: "Status",
      render: (payment) => (
        <PaymentStatusBadge state={payment.state as PaymentState} />
      ),
    },
    {
      key: "amount",
      label: "Amount",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (payment) => (
        <TableAmountCell value={payment.amount} currency="MWK" />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (payment) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <SecondaryButton
            type="button"
            size="sm"
            onClick={() => onRowClick?.(payment)}
          >
            View payment
          </SecondaryButton>
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={payments}
      columns={columns}
      getRowKey={(payment) => String(payment.id)}
      onRowClick={onRowClick}
    />
  );
}
