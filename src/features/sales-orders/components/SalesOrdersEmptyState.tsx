import { ShoppingCart } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type SalesOrdersEmptyStateProps = {
  onNewOrder: () => void;
};

export function SalesOrdersEmptyState({
  onNewOrder,
}: SalesOrdersEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="sales-orders-empty-state"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <ShoppingCart className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">
        No sales orders yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Sales orders from ERP will appear here once visits generate billing
        records.
      </p>
      <AddActionButton
        label="Create sales order"
        className="mt-6"
        onClick={onNewOrder}
        data-testid="create-first-sales-order-button"
      />
    </div>
  );
}
