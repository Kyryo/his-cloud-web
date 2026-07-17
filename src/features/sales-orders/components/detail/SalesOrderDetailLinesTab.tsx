"use client";

import { SalesOrderLinesEditor } from "@/features/sales-orders/components/detail/SalesOrderLinesEditor";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

type SalesOrderDetailLinesTabProps = {
  order: SalesOrder;
  isActive: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
  onSplitMismatchChange?: (hasMismatch: boolean) => void;
};

export function SalesOrderDetailLinesTab({
  order,
  isActive,
  onOrderUpdated,
  onSplitMismatchChange,
}: SalesOrderDetailLinesTabProps) {
  return (
    <SalesOrderLinesEditor
      order={order}
      isActive={isActive}
      onOrderUpdated={onOrderUpdated}
      onSplitMismatchChange={onSplitMismatchChange}
    />
  );
}
