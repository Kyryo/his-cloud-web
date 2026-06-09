"use client";

import type { SalesOrder, SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
} from "@/features/sales-orders/utils/format-sales-order";
import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";
import { cn } from "@/lib/utils";

type SalesOrderDetailLinesTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

function formatQuantity(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const quantity = Number(value);
  if (!Number.isFinite(quantity)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(quantity);
}

export function SalesOrderDetailLinesTab({
  order,
  isActive,
}: SalesOrderDetailLinesTabProps) {
  if (!isActive) {
    return null;
  }

  const lines = order.order_lines ?? [];
  const currency = formatSalesOrderCurrency(order);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-brand-navy">No line items</p>
        <p className="mt-2 text-sm text-brand-muted">
          This sales order does not have any line items yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
              >
                Item
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
              >
                Product
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
              >
                Qty
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
              >
                Unit price
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
              >
                Subtotal
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {lines.map((line: SalesOrderLine) => (
              <tr key={line.id}>
                <td className="px-4 py-3 text-sm text-brand-navy">{line.name}</td>
                <td className="px-4 py-3 text-sm text-brand-slate">
                  {formatOdooRelation(line.product_id)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-brand-slate">
                  {formatQuantity(line.product_uom_qty)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-brand-slate">
                  {formatSalesOrderAmount(line.price_unit, currency)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-brand-slate">
                  {formatSalesOrderAmount(line.price_subtotal, currency)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                  {formatSalesOrderAmount(line.price_total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
