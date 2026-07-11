import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

type LinePayability = {
  is_payable?: boolean;
};

export function orderHasPricelist(order: SalesOrder): boolean {
  return Boolean(order.pricelist_id || order.pricelist_uuid);
}

export function isSalesOrderLineNonPayable(
  order: SalesOrder,
  line: LinePayability,
): boolean {
  return orderHasPricelist(order) && line.is_payable === false;
}

export function resolveInitialLineIsPayable(
  order: SalesOrder,
  hasPricelistFixedPrice: boolean,
): boolean | undefined {
  if (!orderHasPricelist(order)) {
    return undefined;
  }

  return hasPricelistFixedPrice;
}
