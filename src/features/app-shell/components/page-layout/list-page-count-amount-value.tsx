"use client";

import type { ReactNode } from "react";

import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";

export function ListPageCountAmountValue({
  count,
  total,
}: {
  count: number;
  total: number | string;
}): ReactNode {
  const fullAmount = formatSalesOrderAmount(total, "MWK");

  return (
    <div className="space-y-0.5">
      <div title={`${count} items`}>{formatCompactNumber(count)}</div>
      <div
        className="text-xs font-normal text-muted-foreground"
        title={fullAmount}
      >
        {formatCompactAmount(total)} MWK
      </div>
    </div>
  );
}
