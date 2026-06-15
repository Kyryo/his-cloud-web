"use client";

import { SalesOrderLinesEditor } from "@/features/sales-orders/components/detail/SalesOrderLinesEditor";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

type SalesOrderDetailLinesTabProps = {
  order: SalesOrder;
  isActive: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
};

export function SalesOrderDetailLinesTab({
  order,
  isActive,
  onOrderUpdated,
}: SalesOrderDetailLinesTabProps) {
  return (
    <SalesOrderLinesEditor
      order={order}
      isActive={isActive}
      onOrderUpdated={onOrderUpdated}
    />
  );
}
